import { prisma } from "../lib/prisma.js";
import { generateWeapon } from "../utils/weaponGenerator.js";

const MAX_OFFLINE_SECONDS = 8 * 60 * 60; // 8 hours
const HP_REGEN_PER_SECOND = 10; // used for the recovery timer display on the frontend

// Item types that can drop
const DROP_TYPES = ["sword", "chest", "helm", "legs"];

// Equipment slot groups — equipping unequips others in the same slot only
const SLOT_GROUPS = {
    weapon: ["sword", "longsword", "greatsword", "dagger"],
    chest:  ["chest"],
    helm:   ["helm"],
    legs:   ["legs"],
};

function getSlotTypes(weaponType) {
    for (const types of Object.values(SLOT_GROUPS)) {
        if (types.includes(weaponType)) return types;
    }
    return [weaponType];
}

// Base drop chance per kill (20%)
const WEAPON_DROP_CHANCE = 0.2;

function randomDropType() {
    return DROP_TYPES[Math.floor(Math.random() * DROP_TYPES.length)];
}

// XP required to reach a given level (simple quadratic curve)
export function xpForLevel(level) {
    return Math.floor(50 * Math.pow(level, 1.8));
}

// Compute effective stats from equipped generated weapons
function computeStats(character) {
    let attack = character.baseAttack;
    let defense = character.baseDefense;
    let maxHp = character.baseMaxHp;
    let speed = 0;
    let magic = 0;

    for (const weapon of character.weapons) {
        if (weapon.equipped) {
            const stats = weapon.stats;
            if (stats.attack)  attack  += stats.attack;
            if (stats.defense) defense += stats.defense;
            if (stats.speed)   speed   += stats.speed;
            if (stats.magic)   magic   += stats.magic;
            if (stats.maxHp)   maxHp   += stats.maxHp;
        }
    }

    return { attack, defense, maxHp, speed, magic };
}

// Shared combat parameter derivation — single source of truth for all combat math.
function calcCombatParams(stats, enemy) {
    const { attack, defense, speed, magic } = stats;
    const k = 50 * enemy.level;
    const attacksPerSec = 0.5 + speed / 50;
    const playerReduction = enemy.defense / (enemy.defense + k);
    const dmgPerHit = Math.max(1, Math.round((attack + magic) * (1 - playerReduction)));
    const hitsToKillEnemy = Math.max(1, Math.ceil(enemy.hp / dmgPerHit));
    const timeToKillEnemy = hitsToKillEnemy / attacksPerSec;
    const killsPerSec = attacksPerSec / hitsToKillEnemy;
    const enemyAttackSpeed = enemy.attackSpeed ?? 1.0;
    const enemyReduction = defense / (defense + k);
    const enemyDmgPerHit = Math.max(1, Math.round(enemy.attack * (1 - enemyReduction)));
    const hpLostPerKill = enemyDmgPerHit * enemyAttackSpeed * timeToKillEnemy;
    return { attacksPerSec, dmgPerHit, hitsToKillEnemy, timeToKillEnemy, killsPerSec, enemyDmgPerHit, hpLostPerKill };
}

// Simulate N seconds of combat. Returns kills achieved, HP remaining, and seconds used.
// Player dies if HP hits 0 mid-fight; kills are clamped accordingly.
function simulateCombat(stats, enemy, seconds, startingHp) {
    const { timeToKillEnemy, hpLostPerKill } = calcCombatParams(stats, enemy);

    let hp = startingHp;
    let kills = 0;
    let timeLeft = seconds;

    while (timeLeft >= timeToKillEnemy && hp > 0) {
        if (hp <= hpLostPerKill) {
            // Player dies partway through this kill — advance time proportionally
            timeLeft -= (hp / hpLostPerKill) * timeToKillEnemy;
            hp = 0;
            break;
        }
        hp -= hpLostPerKill;
        kills++;
        timeLeft -= timeToKillEnemy;
    }

    // Account for damage taken during the partial kill cycle remaining
    if (timeLeft > 0 && hp > 0) {
        const partialDamage = (timeLeft / timeToKillEnemy) * hpLostPerKill;
        hp = Math.max(0, hp - partialDamage);
        timeLeft = 0;
    }

    return { kills, hpRemaining: Math.max(0, hp), secondsUsed: seconds - timeLeft };
}

// Simulate offline time with full death/regen cycles.
// Unlike simulateCombat (single pass), this loops: die → regen → fight again.
function simulateOffline(stats, enemy, seconds, startingHp) {
    let timeLeft = seconds;
    let hp = startingHp;
    let totalKills = 0;

    // Handle starting dead
    if (hp <= 0) {
        const regenTime = Math.min(timeLeft, stats.maxHp / HP_REGEN_PER_SECOND);
        hp = Math.min(stats.maxHp, HP_REGEN_PER_SECOND * regenTime);
        timeLeft -= regenTime;
    }

    while (timeLeft > 0 && hp > 0) {
        const { kills, hpRemaining, secondsUsed } = simulateCombat(stats, enemy, timeLeft, hp);
        totalKills += kills;
        hp = hpRemaining;
        timeLeft -= secondsUsed;

        if (hp > 0) break; // survived to end of available time

        // Died — regen before fighting again
        const regenTime = Math.min(timeLeft, stats.maxHp / HP_REGEN_PER_SECOND);
        if (regenTime <= 0) break;
        hp = Math.min(stats.maxHp, HP_REGEN_PER_SECOND * regenTime);
        timeLeft -= regenTime;
    }

    return { kills: totalKills, hpRemaining: Math.max(0, hp) };
}

function formatCharacter(character) {
    const stats = computeStats(character);
    const xpNeeded = xpForLevel(character.level + 1);
    const currentHp = Math.min(character.currentHp, stats.maxHp);

    const weaponItems = character.weapons.map((w) => ({
        id: w.id,
        source: "weapon",
        name: w.name,
        type: w.weaponType,
        typeLabel: w.typeLabel,
        rarity: w.rarity,
        origin: w.origin,
        level: w.level,
        stats: w.stats,
        baseStats: w.baseStats,
        parts: w.parts,
        totalRating: w.totalRating,
        equipped: w.equipped,
        quantity: 1,
    }));

    return {
        id: character.id,
        level: character.level,
        xp: character.xp,
        xpNeeded,
        currentZone: character.currentZone,
        totalKills: character.totalKills,
        currentEnemyId: character.currentEnemyId,
        baseAttack: character.baseAttack,
        baseDefense: character.baseDefense,
        baseMaxHp: character.baseMaxHp,
        attack: stats.attack,
        defense: stats.defense,
        maxHp: stats.maxHp,
        speed: stats.speed,
        magic: stats.magic,
        currentHp,
        inventory: weaponItems,
        createdAt: character.createdAt,
        updatedAt: character.updatedAt,
    };
}

const characterInclude = {
    weapons: {
        orderBy: { id: "desc" },
    },
};

// Roll weapon drops for a number of kills against an enemy
function rollWeaponDrops(kills, enemyLevel) {
    const drops = [];
    for (let k = 0; k < kills; k++) {
        if (Math.random() < WEAPON_DROP_CHANCE) {
            const type = randomDropType();
            const weapon = generateWeapon(type, enemyLevel);
            drops.push(weapon);
        }
    }
    return drops;
}

export async function getOrCreateCharacter(userId) {
    let character = await prisma.idleCharacter.findUnique({
        where: { userId },
        include: {
            ...characterInclude,
            currentEnemy: {
                include: { drops: { include: { item: true } } },
            },
        },
    });

    if (!character) {
        character = await prisma.idleCharacter.create({
            data: { userId },
            include: {
                ...characterInclude,
                currentEnemy: { include: { drops: { include: { item: true } } } },
            },
        });
        return { character: formatCharacter(character), offlineGains: null };
    }

    // Calculate offline progress
    let offlineGains = null;
    if (character.lastOnline && character.currentEnemy && character.currentEnemy.zone === character.currentZone) {
        const secondsOffline = Math.min(
            (Date.now() - new Date(character.lastOnline).getTime()) / 1000,
            MAX_OFFLINE_SECONDS
        );

        if (secondsOffline >= 1) {
            const stats = computeStats(character);

            const { kills, hpRemaining } = simulateOffline(
                stats, character.currentEnemy, secondsOffline, character.currentHp
            );

            if (kills > 0) {
                const xpGained = kills * character.currentEnemy.xpReward;
                let newXp = character.xp + xpGained;
                let newLevel = character.level;
                let levelUps = 0;

                while (newXp >= xpForLevel(newLevel + 1)) {
                    newXp -= xpForLevel(newLevel + 1);
                    newLevel++;
                    levelUps++;
                }

                const weaponDrops = rollWeaponDrops(kills, character.currentEnemy.level);

                await prisma.$transaction([
                    prisma.idleCharacter.update({
                        where: { id: character.id },
                        data: {
                            xp: newXp,
                            level: newLevel,
                            baseAttack: { increment: levelUps },
                            totalKills: { increment: kills },
                            currentHp: Math.round(hpRemaining),
                            lastOnline: new Date(),
                        },
                    }),
                    ...weaponDrops.map((w) =>
                        prisma.idleWeapon.create({
                            data: {
                                characterId: character.id,
                                name: w.name,
                                weaponType: w.type,
                                typeLabel: w.typeLabel,
                                rarity: w.rarity,
                                origin: w.origin,
                                level: w.level,
                                stats: w.stats,
                                baseStats: w.baseStats,
                                parts: w.parts,
                                totalRating: w.totalRating,
                            },
                        })
                    ),
                ]);

                offlineGains = {
                    secondsOffline: Math.floor(secondsOffline),
                    kills,
                    xpGained,
                    levelUps,
                    drops: weaponDrops.map((w) => ({
                        name: w.name,
                        rarity: w.rarity,
                        count: 1,
                    })),
                    enemyName: character.currentEnemy.name,
                };

                character = await prisma.idleCharacter.findUnique({
                    where: { userId },
                    include: {
                        ...characterInclude,
                        currentEnemy: { include: { drops: { include: { item: true } } } },
                    },
                });
            }
        }
    }

    await prisma.idleCharacter.update({
        where: { id: character.id },
        data: { lastOnline: new Date() },
    });

    return { character: formatCharacter(character), offlineGains };
}

export async function processTick(userId, { enemyId, kills, durationSeconds }) {
    const tickNow = Date.now();
    let [character, enemy] = await Promise.all([
        prisma.idleCharacter.findUnique({
            where: { userId },
            include: characterInclude,
        }),
        prisma.idleEnemy.findUnique({ where: { id: enemyId } }),
    ]);

    if (!character) throw new Error("Character not found");
    if (!enemy) throw new Error("Enemy not found");
    if (enemy.zone !== character.currentZone) throw new Error("Enemy not in current zone");

    // ── Phone-sleep catch-up ──
    // If the actual gap since lastOnline is much larger than the client-reported durationSeconds,
    // the device was likely sleeping with the tab frozen (no ticks fired, no visibilitychange).
    // Simulate the missed time now so the player isn't penalised for device sleep.
    let offlineGains = null;
    const SLEEP_THRESHOLD_SECONDS = 60;
    if (character.lastOnline) {
        const actualGapSeconds = (tickNow - new Date(character.lastOnline).getTime()) / 1000;
        const extraGapSeconds = actualGapSeconds - durationSeconds;
        if (extraGapSeconds > SLEEP_THRESHOLD_SECONDS) {
            const catchUpSeconds = Math.min(extraGapSeconds, MAX_OFFLINE_SECONDS);
            const catchUpStats = computeStats(character);
            const { kills: offlineKills, hpRemaining: offlineHp } = simulateOffline(
                catchUpStats, enemy, catchUpSeconds, character.currentHp
            );
            if (offlineKills > 0) {
                const xpGained = offlineKills * enemy.xpReward;
                let newXp = character.xp + xpGained;
                let newLevel = character.level;
                let levelUps = 0;
                while (newXp >= xpForLevel(newLevel + 1)) {
                    newXp -= xpForLevel(newLevel + 1);
                    newLevel++;
                    levelUps++;
                }
                const weaponDrops = rollWeaponDrops(offlineKills, enemy.level);
                await prisma.$transaction([
                    prisma.idleCharacter.update({
                        where: { id: character.id },
                        data: {
                            xp: newXp,
                            level: newLevel,
                            baseAttack: { increment: levelUps },
                            totalKills: { increment: offlineKills },
                            currentHp: Math.round(offlineHp),
                            lastOnline: new Date(tickNow - durationSeconds * 1000),
                        },
                    }),
                    ...weaponDrops.map((w) =>
                        prisma.idleWeapon.create({
                            data: {
                                characterId: character.id,
                                name: w.name,
                                weaponType: w.type,
                                typeLabel: w.typeLabel,
                                rarity: w.rarity,
                                origin: w.origin,
                                level: w.level,
                                stats: w.stats,
                                baseStats: w.baseStats,
                                parts: w.parts,
                                totalRating: w.totalRating,
                            },
                        })
                    ),
                ]);
                offlineGains = {
                    secondsOffline: Math.floor(extraGapSeconds),
                    kills: offlineKills,
                    xpGained,
                    levelUps,
                    drops: weaponDrops.map((w) => ({ name: w.name, rarity: w.rarity, count: 1 })),
                    enemyName: enemy.name,
                };
            } else {
                // No kills during catch-up (probably dead the whole time) — backdate lastOnline
                // so the normal tick doesn't re-process the same gap
                await prisma.idleCharacter.update({
                    where: { id: character.id },
                    data: { currentHp: Math.round(offlineHp), lastOnline: new Date(tickNow - durationSeconds * 1000) },
                });
            }
            // Reload character with updated state for the normal tick below
            character = await prisma.idleCharacter.findUnique({ where: { userId }, include: characterInclude });
        }
    }

    const stats = computeStats(character);

    // If the gap is large with zero kills, the browser tab was throttled in the background.
    // Skip the tick entirely — don't touch lastOnline so the offline gains system sees the
    // correct elapsed time when the frontend refreshes.
    const THROTTLE_GAP_SECONDS = 30;
    if (kills === 0 && durationSeconds > THROTTLE_GAP_SECONDS) {
        return { character: formatCharacter(character), drops: [], levelUps: 0, xpGained: 0, killsProcessed: 0, died: false, offlineGains };
    }

    // If player is dead, regen HP instead of fighting — always restore fully in one tick
    // to avoid the server/frontend disagreeing on alive state across multiple ticks
    if (character.currentHp <= 0) {
        const newHp = stats.maxHp;
        await prisma.idleCharacter.update({
            where: { id: character.id },
            data: { currentHp: newHp, lastOnline: new Date(), currentEnemyId: enemyId },
        });
        const updated = await prisma.idleCharacter.findUnique({ where: { id: character.id }, include: characterInclude });
        return { character: formatCharacter(updated), drops: [], levelUps: 0, xpGained: 0, killsProcessed: 0, offlineGains };
    }

    // Compute max plausible kills via continuous kill rate (avoids simulateCombat returning 0
    // when one kill takes longer than the tick duration)
    const { killsPerSec } = calcCombatParams(stats, enemy);
    const maxAllowed = Math.ceil(killsPerSec * durationSeconds * 1.2);
    const validatedKills = Math.min(kills, maxAllowed);

    // Still use simulateCombat for accurate HP remaining
    const { hpRemaining } = simulateCombat(stats, enemy, durationSeconds, character.currentHp);

    if (validatedKills === 0) {
        await prisma.idleCharacter.update({ where: { id: character.id }, data: { currentHp: Math.round(hpRemaining), lastOnline: new Date(), currentEnemyId: enemyId } });
        const updated = await prisma.idleCharacter.findUnique({ where: { id: character.id }, include: characterInclude });
        return { character: formatCharacter(updated), drops: [], levelUps: 0, xpGained: 0, killsProcessed: 0, offlineGains };
    }

    const xpGained = validatedKills * enemy.xpReward;
    let newXp = character.xp + xpGained;
    let newLevel = character.level;
    let levelUps = 0;

    while (newXp >= xpForLevel(newLevel + 1)) {
        newXp -= xpForLevel(newLevel + 1);
        newLevel++;
        levelUps++;
    }

    const weaponDrops = rollWeaponDrops(validatedKills, enemy.level);

    await prisma.$transaction([
        prisma.idleCharacter.update({
            where: { id: character.id },
            data: {
                xp: newXp,
                level: newLevel,
                baseAttack: { increment: levelUps },
                totalKills: { increment: validatedKills },
                currentHp: Math.round(hpRemaining),
                lastOnline: new Date(),
                currentEnemyId: enemyId,
            },
        }),
        ...weaponDrops.map((w) =>
            prisma.idleWeapon.create({
                data: {
                    characterId: character.id,
                    name: w.name,
                    weaponType: w.type,
                    typeLabel: w.typeLabel,
                    rarity: w.rarity,
                    origin: w.origin,
                    level: w.level,
                    stats: w.stats,
                    baseStats: w.baseStats,
                    parts: w.parts,
                    totalRating: w.totalRating,
                },
            })
        ),
    ]);

    const updatedCharacter = await prisma.idleCharacter.findUnique({
        where: { id: character.id },
        include: characterInclude,
    });

    return {
        character: formatCharacter(updatedCharacter),
        drops: weaponDrops.map((w) => ({
            name: w.name,
            rarity: w.rarity,
            count: 1,
        })),
        levelUps,
        xpGained,
        killsProcessed: validatedKills,
        died: hpRemaining <= 0,
        offlineGains,
    };
}

export async function resetCharacter(userId) {
    const character = await prisma.idleCharacter.findUnique({ where: { userId } });
    if (!character) throw new Error("Character not found");

    await prisma.idleCharacter.update({
        where: { id: character.id },
        data: {
            level: 1,
            xp: 0,
            baseAttack: 5,
            baseDefense: 0,
            baseMaxHp: 100,
            currentHp: 100,
            totalKills: 0,
        },
    });

    const updated = await prisma.idleCharacter.findUnique({ where: { id: character.id }, include: characterInclude });
    return formatCharacter(updated);
}

export async function reviveCharacter(userId) {
    const character = await prisma.idleCharacter.findUnique({ where: { userId }, include: characterInclude });
    if (!character) throw new Error("Character not found");

    const stats = computeStats(character);
    await prisma.idleCharacter.update({ where: { id: character.id }, data: { currentHp: stats.maxHp } });

    const updated = await prisma.idleCharacter.findUnique({ where: { id: character.id }, include: characterInclude });
    return formatCharacter(updated);
}

export async function equipItem(userId, inventoryItemId, { equipped, source }) {
    const character = await prisma.idleCharacter.findUnique({ where: { userId } });
    if (!character) throw new Error("Character not found");

    if (source === "weapon") {
        const weapon = await prisma.idleWeapon.findFirst({
            where: { id: inventoryItemId, characterId: character.id },
        });
        if (!weapon) throw new Error("Weapon not found");

        if (equipped) {
            const slotTypes = getSlotTypes(weapon.weaponType);
            await prisma.idleWeapon.updateMany({
                where: { characterId: character.id, equipped: true, weaponType: { in: slotTypes } },
                data: { equipped: false },
            });
        }

        await prisma.idleWeapon.update({
            where: { id: inventoryItemId },
            data: { equipped },
        });
    } else {
        const invItem = await prisma.idleInventoryItem.findFirst({
            where: { id: inventoryItemId, characterId: character.id },
            include: { item: true },
        });
        if (!invItem) throw new Error("Item not found in inventory");

        if (equipped && (invItem.item.type === "weapon" || invItem.item.type === "armor")) {
            await prisma.idleInventoryItem.updateMany({
                where: {
                    characterId: character.id,
                    equipped: true,
                    item: { type: invItem.item.type },
                },
                data: { equipped: false },
            });
        }

        await prisma.idleInventoryItem.update({
            where: { id: inventoryItemId },
            data: { equipped },
        });
    }

    const updated = await prisma.idleCharacter.findUnique({
        where: { id: character.id },
        include: characterInclude,
    });

    return formatCharacter(updated);
}

export async function discardMany(userId, items) {
    const character = await prisma.idleCharacter.findUnique({ where: { userId } });
    if (!character) throw new Error("Character not found");

    const weaponIds = items.filter((i) => i.source === "weapon").map((i) => i.id);
    const itemIds   = items.filter((i) => i.source !== "weapon").map((i) => i.id);

    await prisma.$transaction([
        ...(weaponIds.length > 0 ? [prisma.idleWeapon.deleteMany({
            where: { id: { in: weaponIds }, characterId: character.id },
        })] : []),
        ...(itemIds.length > 0 ? [prisma.idleInventoryItem.deleteMany({
            where: { id: { in: itemIds }, characterId: character.id },
        })] : []),
    ]);

    const updated = await prisma.idleCharacter.findUnique({
        where: { id: character.id },
        include: characterInclude,
    });
    return formatCharacter(updated);
}

export async function discardItem(userId, itemId, source) {
    const character = await prisma.idleCharacter.findUnique({ where: { userId } });
    if (!character) throw new Error("Character not found");

    if (source === "weapon") {
        const weapon = await prisma.idleWeapon.findFirst({
            where: { id: itemId, characterId: character.id },
        });
        if (!weapon) throw new Error("Weapon not found");
        await prisma.idleWeapon.delete({ where: { id: itemId } });
    } else {
        const invItem = await prisma.idleInventoryItem.findFirst({
            where: { id: itemId, characterId: character.id },
        });
        if (!invItem) throw new Error("Item not found");
        await prisma.idleInventoryItem.delete({ where: { id: itemId } });
    }

    const updated = await prisma.idleCharacter.findUnique({
        where: { id: character.id },
        include: characterInclude,
    });
    return formatCharacter(updated);
}

export async function changeZone(userId, zone) {
    const validZones = await prisma.idleEnemy.findMany({
        where: { zone },
        select: { zone: true },
    });
    if (validZones.length === 0) throw new Error("Invalid zone");

    const updated = await prisma.idleCharacter.update({
        where: { userId },
        data: { currentZone: zone, currentEnemyId: null },
        include: characterInclude,
    });

    return formatCharacter(updated);
}

export async function getEnemiesForZone(zone) {
    return prisma.idleEnemy.findMany({
        where: { zone },
        orderBy: { level: "asc" },
    });
}

export async function getZones() {
    const result = await prisma.idleEnemy.findMany({
        select: { zone: true },
        distinct: ["zone"],
        orderBy: { level: "asc" },
    });
    return result.map((r) => r.zone);
}
