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
    // Forest pool (regular)
    { name: "Forest Goblin", world: "forest", isBoss: false, baseHp: 20, baseAttack: 3, baseDefense: 1, attackSpeed: 0.8, xpReward: 15 },
    { name: "Wild Wolf",     world: "forest", isBoss: false, baseHp: 35, baseAttack: 5, baseDefense: 3, attackSpeed: 1.2, xpReward: 20 },
    { name: "Forest Troll",  world: "forest", isBoss: false, baseHp: 55, baseAttack: 7, baseDefense: 5, attackSpeed: 0.5, xpReward: 25 },
    // Forest boss
    { name: "Giant Slime",   world: "forest", isBoss: true,  baseHp: 300, baseAttack: 20, baseDefense: 12, attackSpeed: 0.7, xpReward: 200 },

    // Cave pool (regular)
    { name: "Cave Bat",  world: "cave", isBoss: false, baseHp: 25, baseAttack: 5, baseDefense: 2, attackSpeed: 1.5, xpReward: 30 },
    { name: "Rock Golem",world: "cave", isBoss: false, baseHp: 70, baseAttack: 6, baseDefense: 9, attackSpeed: 0.4, xpReward: 40 },
    { name: "Cave Troll",world: "cave", isBoss: false, baseHp: 60, baseAttack: 8, baseDefense: 6, attackSpeed: 0.5, xpReward: 35 },
    // Cave boss
    { name: "Thornwood Ancient", world: "cave", isBoss: true, baseHp: 400, baseAttack: 25, baseDefense: 18, attackSpeed: 0.5, xpReward: 400 },

    // Dungeon pool (regular)
    { name: "Skeleton Warrior", world: "dungeon", isBoss: false, baseHp: 50, baseAttack: 9,  baseDefense: 6,  attackSpeed: 0.8, xpReward: 50 },
    { name: "Dark Knight",      world: "dungeon", isBoss: false, baseHp: 75, baseAttack: 12, baseDefense: 10, attackSpeed: 0.6, xpReward: 65 },
    { name: "Ancient Dragon",   world: "dungeon", isBoss: false, baseHp: 100,baseAttack: 16, baseDefense: 14, attackSpeed: 0.4, xpReward: 85 },
    // Dungeon boss
    { name: "Dungeon Warden",   world: "dungeon", isBoss: true,  baseHp: 500, baseAttack: 30, baseDefense: 25, attackSpeed: 0.6, xpReward: 700 },

    // Swamp pool (regular)
    { name: "Bog Witch",          world: "swamp", isBoss: false, baseHp: 90,  baseAttack: 16, baseDefense: 10, attackSpeed: 0.9, xpReward: 100 },
    { name: "Swamp Lurker",       world: "swamp", isBoss: false, baseHp: 130, baseAttack: 18, baseDefense: 14, attackSpeed: 0.6, xpReward: 115 },
    { name: "Venomfang Serpent",  world: "swamp", isBoss: false, baseHp: 110, baseAttack: 22, baseDefense: 11, attackSpeed: 1.1, xpReward: 125 },
    // Swamp boss
    { name: "Hydra",              world: "swamp", isBoss: true,  baseHp: 700, baseAttack: 42, baseDefense: 32, attackSpeed: 0.7, xpReward: 1100 },

    // Tundra pool (regular)
    { name: "Frost Wraith",  world: "tundra", isBoss: false, baseHp: 130, baseAttack: 22, baseDefense: 14, attackSpeed: 1.0, xpReward: 160 },
    { name: "Yeti",          world: "tundra", isBoss: false, baseHp: 200, baseAttack: 25, baseDefense: 20, attackSpeed: 0.5, xpReward: 175 },
    { name: "Ice Elemental", world: "tundra", isBoss: false, baseHp: 160, baseAttack: 30, baseDefense: 17, attackSpeed: 0.8, xpReward: 185 },
    // Tundra boss
    { name: "Frost Giant",   world: "tundra", isBoss: true,  baseHp: 950, baseAttack: 55, baseDefense: 42, attackSpeed: 0.5, xpReward: 1600 },

    // Volcano pool (regular)
    { name: "Lava Imp",    world: "volcano", isBoss: false, baseHp: 170, baseAttack: 28, baseDefense: 18, attackSpeed: 1.2, xpReward: 230 },
    { name: "Magma Golem", world: "volcano", isBoss: false, baseHp: 260, baseAttack: 30, baseDefense: 28, attackSpeed: 0.4, xpReward: 250 },
    { name: "Fire Drake",  world: "volcano", isBoss: false, baseHp: 220, baseAttack: 38, baseDefense: 22, attackSpeed: 0.9, xpReward: 270 },
    // Volcano boss
    { name: "Inferno Wyrm", world: "volcano", isBoss: true, baseHp: 1300, baseAttack: 70, baseDefense: 55, attackSpeed: 0.6, xpReward: 2300 },

    // Abyss pool (regular)
    { name: "Void Shade",    world: "abyss", isBoss: false, baseHp: 220, baseAttack: 36, baseDefense: 22, attackSpeed: 1.3, xpReward: 320 },
    { name: "Abyssal Fiend", world: "abyss", isBoss: false, baseHp: 320, baseAttack: 40, baseDefense: 30, attackSpeed: 0.7, xpReward: 350 },
    { name: "Chaos Spawn",   world: "abyss", isBoss: false, baseHp: 270, baseAttack: 48, baseDefense: 26, attackSpeed: 1.0, xpReward: 370 },
    // Abyss boss
    { name: "Abyssal Lord",  world: "abyss", isBoss: true,  baseHp: 1700, baseAttack: 90, baseDefense: 72, attackSpeed: 0.65, xpReward: 3200 },

    // Celestial pool (regular)
    { name: "Fallen Seraph",   world: "celestial", isBoss: false, baseHp: 290, baseAttack: 46, baseDefense: 30, attackSpeed: 1.1, xpReward: 450 },
    { name: "Astral Sentinel", world: "celestial", isBoss: false, baseHp: 400, baseAttack: 50, baseDefense: 40, attackSpeed: 0.6, xpReward: 480 },
    { name: "Storm Archon",    world: "celestial", isBoss: false, baseHp: 340, baseAttack: 60, baseDefense: 34, attackSpeed: 0.9, xpReward: 510 },
    // Celestial boss
    { name: "Celestial Arbiter", world: "celestial", isBoss: true, baseHp: 2200, baseAttack: 115, baseDefense: 95, attackSpeed: 0.7, xpReward: 4500 },
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
            update: {
                world: enemy.world,
                isBoss: enemy.isBoss,
                baseHp: enemy.baseHp,
                baseAttack: enemy.baseAttack,
                baseDefense: enemy.baseDefense,
                attackSpeed: enemy.attackSpeed,
                xpReward: enemy.xpReward,
            },
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
