import { prisma } from "../lib/prisma.js";
import { generateWeapon } from "../utils/weaponGenerator.js";

const MAX_OFFLINE_SECONDS = 8 * 60 * 60; // 8 hours

// Item types that can drop
const DROP_TYPES = ["sword", "longsword", "greatsword", "dagger", "chest", "helm", "legs"];

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

    for (const weapon of character.weapons) {
        if (weapon.equipped) {
            const stats = weapon.stats;
            if (stats.attack) attack += stats.attack;
            if (stats.defense) defense += stats.defense;
        }
    }

    return { attack, defense, maxHp };
}

function formatCharacter(character) {
    const stats = computeStats(character);
    const xpNeeded = xpForLevel(character.level + 1);

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
    if (character.lastOnline && character.currentEnemy) {
        const secondsOffline = Math.min(
            (Date.now() - new Date(character.lastOnline).getTime()) / 1000,
            MAX_OFFLINE_SECONDS
        );

        if (secondsOffline >= 1) {
            const stats = computeStats(character);
            const damagePerHit = Math.max(1, stats.attack - character.currentEnemy.defense);
            const hitsToKill = Math.ceil(character.currentEnemy.hp / damagePerHit);
            const kills = Math.floor(secondsOffline / hitsToKill);

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
    const [character, enemy] = await Promise.all([
        prisma.idleCharacter.findUnique({
            where: { userId },
            include: characterInclude,
        }),
        prisma.idleEnemy.findUnique({ where: { id: enemyId } }),
    ]);

    if (!character) throw new Error("Character not found");
    if (!enemy) throw new Error("Enemy not found");
    if (enemy.zone !== character.currentZone) throw new Error("Enemy not in current zone");

    // Server-side kill validation
    const stats = computeStats(character);
    const damagePerHit = Math.max(1, stats.attack - enemy.defense);
    const hitsToKill = Math.ceil(enemy.hp / damagePerHit);
    const maxKills = Math.ceil((durationSeconds / hitsToKill) * 1.1);
    const validatedKills = Math.min(kills, Math.max(0, maxKills));

    if (validatedKills === 0) {
        return { character: formatCharacter(character), drops: [], levelUps: 0, xpGained: 0, killsProcessed: 0 };
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
    };
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
        data: { currentZone: zone },
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
        orderBy: { zone: "asc" },
    });
    return result.map((r) => r.zone);
}
