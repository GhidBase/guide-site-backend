// @ts-nocheck
import { prisma } from "../lib/prisma.js";
import { generateWeapon } from "../utils/weaponGenerator.js";

const WORLDS = ["forest", "cave", "dungeon"];
// floors 1-9 regular, floor 10 = boss
const KILLS_PER_FLOOR = 10;
const ENEMY_SCALE = 1.5;
const MAX_OFFLINE_SECONDS = 8 * 60 * 60;
const HP_REGEN_PER_SECOND = 10;

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
export function computeStats(character) {
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

// ── Floor/world helpers ──

function worldFloorLevel(world, floor) {
    const idx = WORLDS.indexOf(world);
    if (idx === -1) throw new Error(`Unknown world: ${world}`);
    return idx * 10 + floor;
}

function scaleEnemy(enemy, floorLevel) {
    const factor = 1 + Math.log(floorLevel + 1) * ENEMY_SCALE;
    return {
        id: enemy.id,
        name: enemy.name,
        world: enemy.world,
        isBoss: enemy.isBoss,
        attackSpeed: enemy.attackSpeed,
        level: floorLevel,
        hp: Math.round(enemy.baseHp * factor),
        attack: Math.round(enemy.baseAttack * factor),
        defense: Math.round(enemy.baseDefense * factor),
        xpReward: Math.round(enemy.xpReward * floorLevel),
    };
}

function getWorldProgress(character, world) {
    const p = (typeof character.worldProgress === 'object' && character.worldProgress !== null)
        ? character.worldProgress : {};
    return p[world] ?? 0;
}

function isWorldUnlocked(character, world) {
    const idx = WORLDS.indexOf(world);
    if (idx === 0) return true;
    return getWorldProgress(character, WORLDS[idx - 1]) >= 10;
}

function isFloorUnlocked(character, world, floor) {
    if (!isWorldUnlocked(character, world)) return false;
    if (floor === 1) return true;
    if (floor === 10) return getWorldProgress(character, world) >= 9;
    return getWorldProgress(character, world) >= floor - 1;
}

async function pickEnemy(world, isBoss) {
    const enemies = await prisma.idleEnemy.findMany({ where: { world, isBoss } });
    if (enemies.length === 0) throw new Error(`No ${isBoss ? 'boss' : 'regular'} enemies found for world: ${world}`);
    return enemies[Math.floor(Math.random() * enemies.length)];
}

const characterInclude = {
    weapons: { orderBy: { id: "desc" } },
    currentEnemy: true,
};

function formatCharacter(character) {
    const stats = computeStats(character);
    const xpNeeded = xpForLevel(character.level + 1);
    const currentHp = Math.min(character.currentHp, stats.maxHp);
    const floorLevel = worldFloorLevel(character.currentWorld, character.currentFloor);

    const weaponItems = character.weapons.map((w) => ({
        id: w.id, source: "weapon", name: w.name, type: w.weaponType,
        typeLabel: w.typeLabel, rarity: w.rarity, origin: w.origin, level: w.level,
        stats: w.stats, baseStats: w.baseStats, parts: w.parts,
        totalRating: w.totalRating, equipped: w.equipped, quantity: 1,
    }));

    const currentEnemy = character.currentEnemy
        ? scaleEnemy(character.currentEnemy, floorLevel)
        : null;

    return {
        id: character.id,
        level: character.level,
        xp: character.xp,
        xpNeeded,
        currentWorld: character.currentWorld,
        currentFloor: character.currentFloor,
        killsOnFloor: character.killsOnFloor,
        worldProgress: character.worldProgress ?? {},
        totalKills: character.totalKills,
        baseAttack: character.baseAttack,
        baseDefense: character.baseDefense,
        baseMaxHp: character.baseMaxHp,
        attack: stats.attack,
        defense: stats.defense,
        maxHp: stats.maxHp,
        speed: stats.speed,
        magic: stats.magic,
        currentHp,
        currentEnemy,
        inventory: weaponItems,
        createdAt: character.createdAt,
        updatedAt: character.updatedAt,
    };
}

async function saveWeaponDrops(characterId, drops) {
    return drops.map((w) =>
        prisma.idleWeapon.create({
            data: {
                characterId,
                name: w.name, weaponType: w.type, typeLabel: w.typeLabel,
                rarity: w.rarity, origin: w.origin, level: w.level,
                stats: w.stats, baseStats: w.baseStats, parts: w.parts,
                totalRating: w.totalRating,
            },
        })
    );
}

export async function getOrCreateCharacter(userId) {
    let character = await prisma.idleCharacter.findUnique({
        where: { userId },
        include: characterInclude,
    });

    if (!character) {
        character = await prisma.idleCharacter.create({
            data: { userId },
            include: characterInclude,
        });
        // Pick a starting enemy for forest floor 1
        const startingEnemy = await pickEnemy("forest", false);
        character = await prisma.idleCharacter.update({
            where: { id: character.id },
            data: { currentEnemyId: startingEnemy.id },
            include: characterInclude,
        });
        return { character: formatCharacter(character), offlineGains: null };
    }

    // Calculate offline progress
    let offlineGains = null;
    if (character.lastOnline && character.currentEnemy) {
        const secondsOffline = Math.min(
            (Date.now() - new Date(character.lastOnline).getTime()) / 1000,
            MAX_OFFLINE_SECONDS
        );

        if (secondsOffline >= 1) {
            const stats = computeStats(character);
            const floorLevel = worldFloorLevel(character.currentWorld, character.currentFloor);
            const scaledEnemy = scaleEnemy(character.currentEnemy, floorLevel);

            const { kills, hpRemaining } = simulateOffline(
                stats, scaledEnemy, secondsOffline, character.currentHp
            );

            if (kills > 0) {
                const xpGained = kills * scaledEnemy.xpReward;
                let newXp = character.xp + xpGained;
                let newLevel = character.level;
                let levelUps = 0;

                while (newXp >= xpForLevel(newLevel + 1)) {
                    newXp -= xpForLevel(newLevel + 1);
                    newLevel++;
                    levelUps++;
                }

                const weaponDrops = rollWeaponDrops(kills, floorLevel);

                // Compute floor advances
                let currentWorld = character.currentWorld;
                let currentFloor = character.currentFloor;
                let killsOnFloor = character.killsOnFloor;
                let worldProgress = (typeof character.worldProgress === 'object' && character.worldProgress !== null)
                    ? { ...character.worldProgress } : {};

                let remainingKills = kills;
                while (remainingKills > 0) {
                    const isBoss = currentFloor === 10;
                    const alreadyCompleted = (worldProgress[currentWorld] ?? 0) >= currentFloor;

                    if (isBoss) {
                        // Boss: 1 kill to beat
                        remainingKills--;
                        worldProgress[currentWorld] = 10;
                        const nextWorldIdx = WORLDS.indexOf(currentWorld) + 1;
                        if (nextWorldIdx < WORLDS.length) {
                            currentWorld = WORLDS[nextWorldIdx];
                            currentFloor = 1;
                            killsOnFloor = 0;
                        } else {
                            // Already at last world boss — stay
                            killsOnFloor = 0;
                            break;
                        }
                    } else if (!alreadyCompleted) {
                        const killsNeeded = KILLS_PER_FLOOR - killsOnFloor;
                        if (remainingKills >= killsNeeded) {
                            remainingKills -= killsNeeded;
                            worldProgress[currentWorld] = currentFloor;
                            currentFloor++;
                            killsOnFloor = 0;
                            if (currentFloor > 10) {
                                // Shouldn't happen but guard
                                currentFloor = 10;
                                break;
                            }
                        } else {
                            killsOnFloor += remainingKills;
                            remainingKills = 0;
                        }
                    } else {
                        // Already completed floor — don't advance, consume remaining kills here
                        break;
                    }
                }

                const dropOps = await saveWeaponDrops(character.id, weaponDrops);
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
                            currentWorld,
                            currentFloor,
                            killsOnFloor,
                            worldProgress,
                        },
                    }),
                    ...dropOps,
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
                    include: characterInclude,
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

export async function processTick(userId, { kills, durationSeconds }) {
    const tickNow = Date.now();
    let character = await prisma.idleCharacter.findUnique({
        where: { userId },
        include: characterInclude,
    });

    if (!character) throw new Error("Character not found");

    // If no currentEnemy, pick one
    if (!character.currentEnemy) {
        const isBoss = character.currentFloor === 10;
        const enemy = await pickEnemy(character.currentWorld, isBoss);
        character = await prisma.idleCharacter.update({
            where: { id: character.id },
            data: { currentEnemyId: enemy.id },
            include: characterInclude,
        });
    }

    const floorLevel = worldFloorLevel(character.currentWorld, character.currentFloor);
    const scaledEnemy = scaleEnemy(character.currentEnemy, floorLevel);

    // ── Phone-sleep catch-up ──
    let offlineGains = null;
    const SLEEP_THRESHOLD_SECONDS = 60;
    if (character.lastOnline) {
        const actualGapSeconds = (tickNow - new Date(character.lastOnline).getTime()) / 1000;
        const extraGapSeconds = actualGapSeconds - durationSeconds;
        if (extraGapSeconds > SLEEP_THRESHOLD_SECONDS) {
            const catchUpSeconds = Math.min(extraGapSeconds, MAX_OFFLINE_SECONDS);
            const catchUpStats = computeStats(character);
            const { kills: offlineKills, hpRemaining: offlineHp } = simulateOffline(
                catchUpStats, scaledEnemy, catchUpSeconds, character.currentHp
            );
            if (offlineKills > 0) {
                const xpGained = offlineKills * scaledEnemy.xpReward;
                let newXp = character.xp + xpGained;
                let newLevel = character.level;
                let levelUps = 0;
                while (newXp >= xpForLevel(newLevel + 1)) {
                    newXp -= xpForLevel(newLevel + 1);
                    newLevel++;
                    levelUps++;
                }
                const weaponDrops = rollWeaponDrops(offlineKills, floorLevel);
                const dropOps = await saveWeaponDrops(character.id, weaponDrops);
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
                    ...dropOps,
                ]);
                offlineGains = {
                    secondsOffline: Math.floor(extraGapSeconds),
                    kills: offlineKills,
                    xpGained,
                    levelUps,
                    drops: weaponDrops.map((w) => ({ name: w.name, rarity: w.rarity, count: 1 })),
                    enemyName: character.currentEnemy.name,
                };
            } else {
                await prisma.idleCharacter.update({
                    where: { id: character.id },
                    data: { currentHp: Math.round(offlineHp), lastOnline: new Date(tickNow - durationSeconds * 1000) },
                });
            }
            // Reload character with updated state
            character = await prisma.idleCharacter.findUnique({ where: { userId }, include: characterInclude });
        }
    }

    const stats = computeStats(character);

    const THROTTLE_GAP_SECONDS = 30;
    if (kills === 0 && durationSeconds > THROTTLE_GAP_SECONDS) {
        return { character: formatCharacter(character), drops: [], levelUps: 0, xpGained: 0, killsProcessed: 0, died: false, offlineGains };
    }

    // If player is dead, regen HP
    if (character.currentHp <= 0) {
        const newHp = stats.maxHp;
        await prisma.idleCharacter.update({
            where: { id: character.id },
            data: { currentHp: newHp, lastOnline: new Date() },
        });
        const updated = await prisma.idleCharacter.findUnique({ where: { id: character.id }, include: characterInclude });
        return { character: formatCharacter(updated), drops: [], levelUps: 0, xpGained: 0, killsProcessed: 0, offlineGains };
    }

    const { killsPerSec } = calcCombatParams(stats, scaledEnemy);
    const maxAllowed = Math.ceil(killsPerSec * durationSeconds * 1.2);
    let validatedKills = Math.min(kills, maxAllowed);

    const { hpRemaining } = simulateCombat(stats, scaledEnemy, durationSeconds, character.currentHp);

    if (validatedKills === 0) {
        await prisma.idleCharacter.update({ where: { id: character.id }, data: { currentHp: Math.round(hpRemaining), lastOnline: new Date() } });
        const updated = await prisma.idleCharacter.findUnique({ where: { id: character.id }, include: characterInclude });
        return { character: formatCharacter(updated), drops: [], levelUps: 0, xpGained: 0, killsProcessed: 0, offlineGains };
    }

    const xpGained = validatedKills * scaledEnemy.xpReward;
    let newXp = character.xp + xpGained;
    let newLevel = character.level;
    let levelUps = 0;

    while (newXp >= xpForLevel(newLevel + 1)) {
        newXp -= xpForLevel(newLevel + 1);
        newLevel++;
        levelUps++;
    }

    const weaponDrops = rollWeaponDrops(validatedKills, floorLevel);

    // ── Floor advancement logic ──
    const isBoss = character.currentFloor === 10;
    const alreadyCompleted = getWorldProgress(character, character.currentWorld) >= character.currentFloor;

    let currentWorld = character.currentWorld;
    let currentFloor = character.currentFloor;
    let killsOnFloor = character.killsOnFloor;
    let worldProgress = (typeof character.worldProgress === 'object' && character.worldProgress !== null)
        ? { ...character.worldProgress } : {};

    let floorAdvanced = false;
    let bossKilled = false;
    let newWorld = null;

    let nextEnemyId = character.currentEnemyId;

    if (isBoss) {
        // Cap kills at 1 for boss
        validatedKills = Math.min(validatedKills, 1);

        if (validatedKills > 0 && hpRemaining > 0) {
            // Boss beaten
            bossKilled = true;
            worldProgress[currentWorld] = 10;
            const nextWorldIdx = WORLDS.indexOf(currentWorld) + 1;
            if (nextWorldIdx < WORLDS.length) {
                newWorld = WORLDS[nextWorldIdx];
                currentWorld = newWorld;
                currentFloor = 1;
                killsOnFloor = 0;
                floorAdvanced = true;
                const nextEnemy = await pickEnemy(currentWorld, false);
                nextEnemyId = nextEnemy.id;
            } else {
                // Last world boss — stay
                killsOnFloor = 0;
                const nextEnemy = await pickEnemy(currentWorld, true);
                nextEnemyId = nextEnemy.id;
            }
        } else if (hpRemaining <= 0) {
            // Player died on boss floor — drop to floor 9
            currentFloor = 9;
            killsOnFloor = 0;
            const nextEnemy = await pickEnemy(currentWorld, false);
            nextEnemyId = nextEnemy.id;
        }
    } else if (!alreadyCompleted) {
        // First-time floor completion
        const newKillsOnFloor = killsOnFloor + validatedKills;
        if (newKillsOnFloor >= KILLS_PER_FLOOR) {
            worldProgress[currentWorld] = currentFloor;
            currentFloor++;
            killsOnFloor = 0;
            floorAdvanced = true;
            if (currentFloor === 10) {
                // Advance to boss floor — pick boss enemy
                const nextEnemy = await pickEnemy(currentWorld, true);
                nextEnemyId = nextEnemy.id;
            } else {
                const nextEnemy = await pickEnemy(currentWorld, false);
                nextEnemyId = nextEnemy.id;
            }
        } else {
            killsOnFloor = newKillsOnFloor;
            // Pick next random enemy for same floor
            const nextEnemy = await pickEnemy(currentWorld, false);
            nextEnemyId = nextEnemy.id;
        }
    } else {
        // Already completed floor — keep going, don't increment killsOnFloor
        const nextEnemy = await pickEnemy(currentWorld, currentFloor === 10);
        nextEnemyId = nextEnemy.id;
    }

    const dropOps = await saveWeaponDrops(character.id, weaponDrops);
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
                currentWorld,
                currentFloor,
                killsOnFloor,
                worldProgress,
                currentEnemyId: nextEnemyId,
            },
        }),
        ...dropOps,
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
        floorAdvanced,
        bossKilled,
        newWorld,
    };
}

export async function changeFloor(userId, { world, floor }) {
    const character = await prisma.idleCharacter.findUnique({ where: { userId }, include: characterInclude });
    if (!character) throw new Error("Character not found");
    if (!WORLDS.includes(world)) throw new Error("Invalid world");
    if (floor < 1 || floor > 10) throw new Error("Invalid floor");
    if (!isFloorUnlocked(character, world, floor)) throw new Error("Floor not unlocked");

    const enemy = await pickEnemy(world, floor === 10);
    const updated = await prisma.idleCharacter.update({
        where: { id: character.id },
        data: { currentWorld: world, currentFloor: floor, killsOnFloor: 0, currentEnemyId: enemy.id },
        include: characterInclude,
    });
    return formatCharacter(updated);
}

export async function getEnemiesForWorld(world) {
    return prisma.idleEnemy.findMany({ where: { world }, orderBy: { id: "asc" } });
}

export async function getWorlds() {
    return [...WORLDS];
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
            currentWorld: "forest",
            currentFloor: 1,
            killsOnFloor: 0,
            worldProgress: {},
            currentEnemyId: null,
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
