import { prisma } from "../lib/prisma.js";

const MAX_OFFLINE_SECONDS = 8 * 60 * 60; // 8 hours

// XP required to reach a given level (simple quadratic curve)
export function xpForLevel(level) {
    return Math.floor(50 * Math.pow(level, 1.8));
}

// Compute effective stats including equipped item bonuses
function computeStats(character) {
    let attack = character.baseAttack;
    let defense = character.baseDefense;
    let maxHp = character.baseMaxHp;

    for (const invItem of character.inventory) {
        if (invItem.equipped && invItem.item.statBonus) {
            const bonus = invItem.item.statBonus;
            if (bonus.attack) attack += bonus.attack;
            if (bonus.defense) defense += bonus.defense;
            if (bonus.maxHp) maxHp += bonus.maxHp;
        }
    }

    return { attack, defense, maxHp };
}

function formatCharacter(character) {
    const stats = computeStats(character);
    const xpNeeded = xpForLevel(character.level + 1);

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
        inventory: character.inventory.map((inv) => ({
            id: inv.id,
            itemId: inv.itemId,
            name: inv.item.name,
            description: inv.item.description,
            type: inv.item.type,
            rarity: inv.item.rarity,
            statBonus: inv.item.statBonus,
            iconUrl: inv.item.iconUrl,
            quantity: inv.quantity,
            equipped: inv.equipped,
        })),
        createdAt: character.createdAt,
        updatedAt: character.updatedAt,
    };
}

const characterInclude = {
    inventory: {
        include: { item: true },
        orderBy: { id: "asc" },
    },
};

// Shared combat resolution logic used by both live ticks and offline catch-up
function resolveCombat(character, enemy, seconds) {
    const stats = computeStats(character);
    const damagePerHit = Math.max(1, stats.attack - enemy.defense);
    const hitsToKill = Math.ceil(enemy.hp / damagePerHit);
    const kills = Math.floor(seconds / hitsToKill);

    if (kills === 0) return null;

    // Roll drops
    const dropMap = {};
    for (let k = 0; k < kills; k++) {
        for (const drop of enemy.drops) {
            if (Math.random() < drop.dropRate) {
                const key = drop.item.id;
                if (!dropMap[key]) dropMap[key] = { item: drop.item, count: 0 };
                dropMap[key].count++;
            }
        }
    }

    // Apply XP and level-ups
    const xpGained = kills * enemy.xpReward;
    let newXp = character.xp + xpGained;
    let newLevel = character.level;
    let levelUps = 0;

    while (newXp >= xpForLevel(newLevel + 1)) {
        newXp -= xpForLevel(newLevel + 1);
        newLevel++;
        levelUps++;
    }

    return { kills, xpGained, newXp, newLevel, levelUps, attackIncrease: levelUps, dropMap };
}

// Build Prisma transaction ops from a resolved combat result
function buildCombatOps(characterId, result) {
    const { kills, newXp, newLevel, attackIncrease, dropMap } = result;

    const inventoryOps = Object.values(dropMap).map(({ item, count }) =>
        prisma.idleInventoryItem.upsert({
            where: { characterId_itemId: { characterId, itemId: item.id } },
            update: { quantity: { increment: count } },
            create: { characterId, itemId: item.id, quantity: count },
        })
    );

    const characterUpdate = prisma.idleCharacter.update({
        where: { id: characterId },
        data: {
            xp: newXp,
            level: newLevel,
            baseAttack: { increment: attackIncrease },
            totalKills: { increment: kills },
            lastOnline: new Date(),
        },
    });

    return [characterUpdate, ...inventoryOps];
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
            const result = resolveCombat(character, character.currentEnemy, secondsOffline);
            if (result) {
                await prisma.$transaction(buildCombatOps(character.id, result));

                offlineGains = {
                    secondsOffline: Math.floor(secondsOffline),
                    kills: result.kills,
                    xpGained: result.xpGained,
                    levelUps: result.levelUps,
                    drops: Object.values(result.dropMap).map(({ item, count }) => ({
                        itemId: item.id,
                        name: item.name,
                        rarity: item.rarity,
                        iconUrl: item.iconUrl,
                        count,
                    })),
                    enemyName: character.currentEnemy.name,
                };

                // Reload after applying gains
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

    // Always stamp lastOnline on load so we track when they were last here
    await prisma.idleCharacter.update({
        where: { id: character.id },
        data: { lastOnline: new Date() },
    });

    return { character: formatCharacter(character), offlineGains };
}

// Process a combat tick sent from the client.
export async function processTick(userId, { enemyId, kills, durationSeconds }) {
    const [character, enemy] = await Promise.all([
        prisma.idleCharacter.findUnique({
            where: { userId },
            include: characterInclude,
        }),
        prisma.idleEnemy.findUnique({
            where: { id: enemyId },
            include: { drops: { include: { item: true } } },
        }),
    ]);

    if (!character) throw new Error("Character not found");
    if (!enemy) throw new Error("Enemy not found");
    if (enemy.zone !== character.currentZone) throw new Error("Enemy not in current zone");

    // Server-side validation: cap kills to what's physically possible
    const stats = computeStats(character);
    const damagePerHit = Math.max(1, stats.attack - enemy.defense);
    const hitsToKill = Math.ceil(enemy.hp / damagePerHit);
    const maxKills = Math.ceil((durationSeconds / hitsToKill) * 1.1); // 10% grace
    const validatedKills = Math.min(kills, Math.max(0, maxKills));

    if (validatedKills === 0) {
        return { character: formatCharacter(character), drops: [], levelUps: 0 };
    }

    // Roll drops server-side
    const dropMap = {};
    for (let k = 0; k < validatedKills; k++) {
        for (const drop of enemy.drops) {
            if (Math.random() < drop.dropRate) {
                const key = drop.item.id;
                if (!dropMap[key]) dropMap[key] = { item: drop.item, count: 0 };
                dropMap[key].count++;
            }
        }
    }

    // Apply XP and check for level-ups
    const xpGained = validatedKills * enemy.xpReward;
    let newXp = character.xp + xpGained;
    let newLevel = character.level;
    let levelUps = 0;

    while (newXp >= xpForLevel(newLevel + 1)) {
        newXp -= xpForLevel(newLevel + 1);
        newLevel++;
        levelUps++;
    }

    const inventoryOps = Object.values(dropMap).map(({ item, count }) =>
        prisma.idleInventoryItem.upsert({
            where: { characterId_itemId: { characterId: character.id, itemId: item.id } },
            update: { quantity: { increment: count } },
            create: { characterId: character.id, itemId: item.id, quantity: count },
        })
    );

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
        ...inventoryOps,
    ]);

    const updatedCharacter = await prisma.idleCharacter.findUnique({
        where: { id: character.id },
        include: characterInclude,
    });

    return {
        character: formatCharacter(updatedCharacter),
        drops: Object.values(dropMap).map(({ item, count }) => ({
            itemId: item.id,
            name: item.name,
            rarity: item.rarity,
            iconUrl: item.iconUrl,
            count,
        })),
        levelUps,
        xpGained,
        killsProcessed: validatedKills,
    };
}

export async function equipItem(userId, inventoryItemId, equipped) {
    const character = await prisma.idleCharacter.findUnique({ where: { userId } });
    if (!character) throw new Error("Character not found");

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
        include: {
            drops: {
                include: { item: { select: { id: true, name: true, rarity: true, iconUrl: true } } },
            },
        },
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
