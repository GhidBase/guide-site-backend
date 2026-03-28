import { prisma } from "../lib/prisma.js";

const items = [
    {
        name: "Rusty Sword",
        type: "weapon",
        rarity: "common",
        description: "A worn blade.",
        statBonus: { attack: 2 },
    },
    {
        name: "Iron Sword",
        type: "weapon",
        rarity: "uncommon",
        description: "Solid iron construction.",
        statBonus: { attack: 5 },
    },
    {
        name: "Steel Sword",
        type: "weapon",
        rarity: "rare",
        description: "Finely forged steel.",
        statBonus: { attack: 10 },
    },
    {
        name: "Leather Cap",
        type: "armor",
        rarity: "common",
        description: "Basic head protection.",
        statBonus: { defense: 2 },
    },
    {
        name: "Iron Helm",
        type: "armor",
        rarity: "uncommon",
        description: "Sturdy iron helmet.",
        statBonus: { defense: 5, maxHp: 10 },
    },
    {
        name: "Steel Plate",
        type: "armor",
        rarity: "rare",
        description: "Heavy steel armor.",
        statBonus: { defense: 12, maxHp: 25 },
    },
    {
        name: "Health Potion",
        type: "consumable",
        rarity: "common",
        description: "Restores a small amount of HP.",
        statBonus: null,
    },
    {
        name: "Goblin Ear",
        type: "material",
        rarity: "common",
        description: "Smells awful.",
        statBonus: null,
    },
    {
        name: "Wolf Fang",
        type: "material",
        rarity: "common",
        description: "Sharp and durable.",
        statBonus: null,
    },
    {
        name: "Troll Hide",
        type: "material",
        rarity: "uncommon",
        description: "Thick and leathery.",
        statBonus: null,
    },
    {
        name: "Dragon Scale",
        type: "material",
        rarity: "rare",
        description: "Nearly indestructible.",
        statBonus: null,
    },
    {
        name: "Cursed Blade",
        type: "weapon",
        rarity: "epic",
        description: "Power at a cost.",
        statBonus: { attack: 20 },
    },
];

const enemies = [
    // Forest (starter zone, levels 1-5)
    {
        name: "Forest Goblin",
        zone: "forest",
        level: 1,
        hp: 65,
        attack: 4,
        defense: 3,
        attackSpeed: 0.6,
        xpReward: 50,
    },
    {
        name: "Wild Wolf",
        zone: "forest",
        level: 3,
        hp: 250,
        attack: 15,
        defense: 15,
        attackSpeed: 1.0,
        xpReward: 100,
    },
    {
        name: "Forest Troll",
        zone: "forest",
        level: 5,
        hp: 400,
        attack: 28,
        defense: 20,
        attackSpeed: 0.4,
        xpReward: 200,
    },

    // Cave (mid zone, levels 6-12)
    {
        name: "Cave Bat",
        zone: "cave",
        level: 6,
        hp: 550,
        attack: 42,
        defense: 35,
        attackSpeed: 1.5,
        xpReward: 280,
    },
    {
        name: "Rock Golem",
        zone: "cave",
        level: 9,
        hp: 850,
        attack: 62,
        defense: 55,
        attackSpeed: 0.3,
        xpReward: 450,
    },
    {
        name: "Cave Troll",
        zone: "cave",
        level: 12,
        hp: 1300,
        attack: 85,
        defense: 70,
        attackSpeed: 0.45,
        xpReward: 650,
    },

    // Dungeon (hard zone, levels 13-20)
    {
        name: "Skeleton Warrior",
        zone: "dungeon",
        level: 13,
        hp: 1800,
        attack: 100,
        defense: 100,
        attackSpeed: 0.7,
        xpReward: 900,
    },
    {
        name: "Dark Knight",
        zone: "dungeon",
        level: 17,
        hp: 2500,
        attack: 135,
        defense: 125,
        attackSpeed: 0.6,
        xpReward: 1400,
    },
    {
        name: "Ancient Dragon",
        zone: "dungeon",
        level: 20,
        hp: 5000,
        attack: 180,
        defense: 175,
        attackSpeed: 0.35,
        xpReward: 2500,
    },
];

// Drop table: [enemyName, itemName, dropRate]
const drops = [
    ["Forest Goblin", "Goblin Ear", 0.4],
    ["Forest Goblin", "Rusty Sword", 0.05],
    ["Forest Goblin", "Health Potion", 0.1],
    ["Wild Wolf", "Wolf Fang", 0.35],
    ["Wild Wolf", "Leather Cap", 0.06],
    ["Wild Wolf", "Health Potion", 0.1],
    ["Forest Troll", "Troll Hide", 0.3],
    ["Forest Troll", "Iron Sword", 0.07],
    ["Forest Troll", "Iron Helm", 0.05],
    ["Cave Bat", "Health Potion", 0.15],
    ["Cave Bat", "Iron Sword", 0.05],
    ["Rock Golem", "Troll Hide", 0.25],
    ["Rock Golem", "Iron Helm", 0.08],
    ["Rock Golem", "Steel Sword", 0.03],
    ["Cave Troll", "Troll Hide", 0.4],
    ["Cave Troll", "Steel Sword", 0.06],
    ["Cave Troll", "Steel Plate", 0.04],
    ["Skeleton Warrior", "Steel Sword", 0.1],
    ["Skeleton Warrior", "Steel Plate", 0.06],
    ["Skeleton Warrior", "Dragon Scale", 0.02],
    ["Dark Knight", "Steel Plate", 0.12],
    ["Dark Knight", "Dragon Scale", 0.05],
    ["Dark Knight", "Cursed Blade", 0.02],
    ["Ancient Dragon", "Dragon Scale", 0.5],
    ["Ancient Dragon", "Cursed Blade", 0.05],
];

async function seed() {
    console.log("Seeding idle game data...");

    // Upsert items
    for (const item of items) {
        await prisma.idleItem.upsert({
            where: { name: item.name },
            update: item,
            create: item,
        });
    }
    console.log(`  ${items.length} items seeded`);

    // Upsert enemies
    for (const enemy of enemies) {
        await prisma.idleEnemy.upsert({
            where: { name: enemy.name },
            update: enemy,
            create: enemy,
        });
    }
    console.log(`  ${enemies.length} enemies seeded`);

    // Seed drop table
    for (const [enemyName, itemName, dropRate] of drops) {
        const enemy = await prisma.idleEnemy.findUnique({
            where: { name: enemyName },
        });
        const item = await prisma.idleItem.findUnique({
            where: { name: itemName },
        });
        if (!enemy || !item) {
            console.warn(
                `  Skipping drop: ${enemyName} -> ${itemName} (not found)`,
            );
            continue;
        }
        const existing = await prisma.idleEnemyDrop.findFirst({
            where: { enemyId: enemy.id, itemId: item.id },
        });
        if (existing) {
            await prisma.idleEnemyDrop.update({
                where: { id: existing.id },
                data: { dropRate },
            });
        } else {
            await prisma.idleEnemyDrop.create({
                data: { enemyId: enemy.id, itemId: item.id, dropRate },
            });
        }
    }
    console.log(`  ${drops.length} drops seeded`);

    console.log("Done.");
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
