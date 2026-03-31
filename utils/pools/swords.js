// ── Sword Blades ──────────────────────────────────────────────────────────────
// Human: attack + defense, speed on tier 4-5, no magic
// Elven: attack + speed, magic on tier 3+, no defense

const SWORD_BLADES = [
    // Elven
    {
        id: "sw_e1",
        origin: "Elven",
        name: "Jeweled Saber",
        rating: 3,
        stats: { attack: 5, speed: 1, magic: 1 },
    },
    {
        id: "sw_e2",
        origin: "Elven",
        name: "Evils Bane",
        rating: 8,
        stats: { attack: 6, speed: 1, magic: 1 },
    },
    {
        id: "sw_e3",
        origin: "Elven",
        name: "Elven Glass Blade",
        rating: 13,
        stats: { attack: 7, speed: 2, magic: 2 },
    },
    {
        id: "sw_e4",
        origin: "Elven",
        name: "Rose Blade",
        rating: 18,
        stats: { attack: 8, speed: 2, magic: 3 },
    },
    {
        id: "sw_e5",
        origin: "Elven",
        name: "Woven Fate",
        rating: 23,
        stats: { attack: 9, speed: 2, magic: 4 },
    },
    // Human
    {
        id: "sw_h1",
        origin: "Human",
        name: "Soldier's Blade",
        rating: 3,
        stats: { attack: 5, defense: 3 },
    },
    {
        id: "sw_h2",
        origin: "Human",
        name: "Tempered Blade",
        rating: 8,
        stats: { attack: 6, defense: 4 },
    },
    {
        id: "sw_h3",
        origin: "Human",
        name: "Knight's Blade",
        rating: 13,
        stats: { attack: 7, defense: 5 },
    },
    {
        id: "sw_h4",
        origin: "Human",
        name: "Fine Steel Sword",
        rating: 18,
        stats: { attack: 8, defense: 6, speed: 1 },
    },
    {
        id: "sw_h5",
        origin: "Human",
        name: "Champion's Edge",
        rating: 23,
        stats: { attack: 9, defense: 7, speed: 1 },
    },
];

// ── Sword Guards ──────────────────────────────────────────────────────────────
// Human: defense-focused, attack on tier 3+
// Elven: defense + speed, magic on tier 3+

const SWORD_GUARDS = [
    // Elven
    {
        id: "gd_e1",
        origin: "Elven",
        name: "Leafbend Guard",
        rating: 3,
        prefix: "Elegant",
        stats: { defense: 4, speed: 1, magic: 1 },
    },
    {
        id: "gd_e2",
        origin: "Elven",
        name: "Moonsilver Guard",
        rating: 8,
        prefix: "Graceful",
        stats: { defense: 6, speed: 1, magic: 1 },
    },
    {
        id: "gd_e3",
        origin: "Elven",
        name: "Starforged Guard",
        rating: 13,
        prefix: "Radiant",
        stats: { defense: 8, speed: 2, magic: 2 },
    },
    {
        id: "gd_e4",
        origin: "Elven",
        name: "Solarbind Guard",
        rating: 18,
        prefix: "Luminous",
        stats: { defense: 9, speed: 2, magic: 2 },
    },
    {
        id: "gd_e5",
        origin: "Elven",
        name: "Celestial Ward",
        rating: 23,
        prefix: "Resplendent",
        stats: { defense: 10, speed: 3, magic: 3 },
    },
    // Human
    {
        id: "gd_h1",
        origin: "Human",
        name: "Soldier's Guard",
        rating: 3,
        prefix: "Reliable",
        stats: { defense: 5 },
    },
    {
        id: "gd_h2",
        origin: "Human",
        name: "Tempered Crossguard",
        rating: 8,
        prefix: "Balanced",
        stats: { defense: 7 },
    },
    {
        id: "gd_h3",
        origin: "Human",
        name: "Knight's Guard",
        rating: 13,
        prefix: "Steadfast",
        stats: { defense: 8, attack: 2 },
    },
    {
        id: "gd_h4",
        origin: "Human",
        name: "Refined Guard",
        rating: 18,
        prefix: "True",
        stats: { defense: 9, attack: 3 },
    },
    {
        id: "gd_h5",
        origin: "Human",
        name: "Grandmaster's Guard",
        rating: 23,
        prefix: "Indomitable",
        stats: { defense: 10, attack: 4 },
    },
];

// ── Sword Grips ───────────────────────────────────────────────────────────────
// Human: attack-focused, defense on tier 4-5
// Elven: speed-focused, magic on tier 3+

const SWORD_GRIPS = [
    // Elven
    {
        id: "g_e1",
        origin: "Elven",
        name: "Silkwood Grip",
        rating: 3,
        prefix: "Swift",
        stats: { speed: 1, magic: 1 },
    },
    {
        id: "g_e2",
        origin: "Elven",
        name: "Moonweave Grip",
        rating: 8,
        prefix: "Nimble",
        stats: { speed: 2, magic: 1 },
    },
    {
        id: "g_e3",
        origin: "Elven",
        name: "Starthread Grip",
        rating: 13,
        prefix: "Ethereal",
        stats: { speed: 2, magic: 2 },
    },
    {
        id: "g_e4",
        origin: "Elven",
        name: "Dreamwoven Grip",
        rating: 18,
        prefix: "Spectral",
        stats: { speed: 3, magic: 2 },
    },
    {
        id: "g_e5",
        origin: "Elven",
        name: "Celestial Grasp",
        rating: 23,
        prefix: "Radiant",
        stats: { speed: 3, magic: 3 },
    },
    // Human
    {
        id: "g_h1",
        origin: "Human",
        name: "Soldier's Grip",
        rating: 3,
        prefix: "Reliable",
        stats: { attack: 3 },
    },
    {
        id: "g_h2",
        origin: "Human",
        name: "Knight's Grip",
        rating: 8,
        prefix: "Balanced",
        stats: { attack: 4 },
    },
    {
        id: "g_h3",
        origin: "Human",
        name: "Champion's Grip",
        rating: 13,
        prefix: "Steadfast",
        stats: { attack: 5 },
    },
    {
        id: "g_h4",
        origin: "Human",
        name: "Tempered Grip",
        rating: 18,
        prefix: "True",
        stats: { attack: 6, defense: 2 },
    },
    {
        id: "g_h5",
        origin: "Human",
        name: "Grandmaster's Grip",
        rating: 23,
        prefix: "Versatile",
        stats: { attack: 7, defense: 4 },
    },
];

// ── Sword Pommels ─────────────────────────────────────────────────────────────
// Human: attack-focused, defense on tier 4-5
// Elven: magic + speed, touch of attack on tier 5

const SWORD_POMMELS = [
    // Elven
    {
        id: "pm_e1",
        origin: "Elven",
        name: "Moonstone Cap",
        rating: 3,
        prefix: null,
        stats: { magic: 2, speed: 1 },
    },
    {
        id: "pm_e2",
        origin: "Elven",
        name: "Starcrystal Pommel",
        rating: 8,
        prefix: null,
        stats: { magic: 3, speed: 1 },
    },
    {
        id: "pm_e3",
        origin: "Elven",
        name: "Celestial Orb",
        rating: 13,
        prefix: null,
        stats: { magic: 4, speed: 1 },
    },
    {
        id: "pm_e4",
        origin: "Elven",
        name: "Aurora Core",
        rating: 18,
        prefix: null,
        stats: { magic: 5, speed: 1 },
    },
    {
        id: "pm_e5",
        origin: "Elven",
        name: "Astral Apex",
        rating: 23,
        prefix: null,
        stats: { magic: 5, speed: 1, attack: 1 },
    },
    // Human
    {
        id: "pm_h1",
        origin: "Human",
        name: "Soldier's Pommel",
        rating: 3,
        prefix: null,
        stats: { attack: 3 },
    },
    {
        id: "pm_h2",
        origin: "Human",
        name: "Fine Steel Pommel",
        rating: 8,
        prefix: null,
        stats: { attack: 4 },
    },
    {
        id: "pm_h3",
        origin: "Human",
        name: "Knight's Pommel",
        rating: 13,
        prefix: null,
        stats: { attack: 5 },
    },
    {
        id: "pm_h4",
        origin: "Human",
        name: "Champion's End",
        rating: 18,
        prefix: null,
        stats: { attack: 6, defense: 2 },
    },
    {
        id: "pm_h5",
        origin: "Human",
        name: "Grandmaster's Pommel",
        rating: 23,
        prefix: null,
        stats: { attack: 7, defense: 4 },
    },
];

// ── Sword Definitions ─────────────────────────────────────────────────────────
// slots[0] is always the primary (locks origin). The rest are secondary.

export const SWORD_DEFINITIONS = {
    sword: {
        label: "Sword",
        slots: [
            { key: "blade", label: "Blade", pool: SWORD_BLADES },
            { key: "guard", label: "Guard", pool: SWORD_GUARDS },
            { key: "grip", label: "Grip", pool: SWORD_GRIPS },
            { key: "pommel", label: "Pommel", pool: SWORD_POMMELS },
        ],
    },
};
