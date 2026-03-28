// ── Origins ───────────────────────────────────────────────────────────────────

export const ORIGINS = {
    ELVEN: "Elven",
    HUMAN: "Human",
};

// ── Rarity ────────────────────────────────────────────────────────────────────
// Rarity is determined by the SUM of all 4 part ratings (range 4–100).
// 0–20   = common
// 21–40  = uncommon
// 41–60  = rare
// 61–80  = epic
// 81–100 = legendary

function calcRarity(totalRating) {
    if (totalRating <= 20) return "common";
    if (totalRating <= 40) return "uncommon";
    if (totalRating <= 60) return "rare";
    if (totalRating <= 80) return "epic";
    return "legendary";
}

// Drop weight for primary part selection by tier (index 0–4 = tier 1–5).
// Heavily skewed toward low tiers so legendaries feel like a real event.
const PRIMARY_TIER_WEIGHTS = [100, 60, 30, 10, 2];

// Rating proximity weight: exponential decay so nearby-rated parts are
// strongly preferred over far-away parts. Handles the full 0-24 difference
// range that comes from ratings spanning 1–25.
function ratingProximityWeight(diff) {
    if (diff === 0) return 50;
    if (diff <= 2) return 25;
    if (diff <= 5) return 10;
    if (diff <= 9) return 3;
    return 1;
}

// ── Shared Pools ──────────────────────────────────────────────────────────────
// 5 parts per origin, one per rarity tier.
// Tier rating bands: tier1=1-5, tier2=6-10, tier3=11-15, tier4=16-20, tier5=21-25
// Parts use representative values within each band with slight variation.

// ── Grip Pool ─────────────────────────────────────────────────────────────────
// Human grips: attack-focused. Tier 4-5 add defense.
// Elven grips:  speed-focused. Tier 3+ add magic.

const GRIP_POOL = [
    // Elven
    {
        id: "g_e1",
        origin: "Elven",
        name: "Silkwood Grip",
        rating: 3,
        prefix: "Swift",
        stats: { speed: 2 },
    },
    {
        id: "g_e2",
        origin: "Elven",
        name: "Moonweave Grip",
        rating: 8,
        prefix: "Nimble",
        stats: { speed: 4 },
    },
    {
        id: "g_e3",
        origin: "Elven",
        name: "Starthread Grip",
        rating: 13,
        prefix: "Ethereal",
        stats: { speed: 6, magic: 2 },
    },
    {
        id: "g_e4",
        origin: "Elven",
        name: "Dreamwoven Grip",
        rating: 18,
        prefix: "Spectral",
        stats: { speed: 8, magic: 4 },
    },
    {
        id: "g_e5",
        origin: "Elven",
        name: "Celestial Grasp",
        rating: 23,
        prefix: "Radiant",
        stats: { speed: 10, magic: 6 },
    },
    // Human
    {
        id: "g_h1",
        origin: "Human",
        name: "Soldier's Grip",
        rating: 3,
        prefix: "Reliable",
        stats: { attack: 2 },
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
        stats: { attack: 6 },
    },
    {
        id: "g_h4",
        origin: "Human",
        name: "Tempered Grip",
        rating: 18,
        prefix: "True",
        stats: { attack: 8, defense: 3 },
    },
    {
        id: "g_h5",
        origin: "Human",
        name: "Grandmaster's Grip",
        rating: 23,
        prefix: "Versatile",
        stats: { attack: 10, defense: 5 },
    },
];

// ── Pommel Pool ───────────────────────────────────────────────────────────────
// Human pommels: attack-focused. Tier 4-5 add defense.
// Elven pommels: magic + speed. Tier 5 adds a touch of attack.

const POMMEL_POOL = [
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
        stats: { magic: 4, speed: 2 },
    },
    {
        id: "pm_e3",
        origin: "Elven",
        name: "Celestial Orb",
        rating: 13,
        prefix: null,
        stats: { magic: 7, speed: 3 },
    },
    {
        id: "pm_e4",
        origin: "Elven",
        name: "Aurora Core",
        rating: 18,
        prefix: null,
        stats: { magic: 10, speed: 4 },
    },
    {
        id: "pm_e5",
        origin: "Elven",
        name: "Astral Apex",
        rating: 23,
        prefix: null,
        stats: { magic: 13, speed: 5, attack: 2 },
    },
    // Human
    {
        id: "pm_h1",
        origin: "Human",
        name: "Soldier's Pommel",
        rating: 3,
        prefix: null,
        stats: { attack: 2 },
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
        stats: { attack: 6 },
    },
    {
        id: "pm_h4",
        origin: "Human",
        name: "Champion's End",
        rating: 18,
        prefix: null,
        stats: { attack: 8, defense: 3 },
    },
    {
        id: "pm_h5",
        origin: "Human",
        name: "Grandmaster's Pommel",
        rating: 23,
        prefix: null,
        stats: { attack: 10, defense: 5 },
    },
];

// ── Guard Pool ────────────────────────────────────────────────────────────────
// Human guards: defense-focused. Tier 3+ add attack.
// Elven guards: defense + speed. Tier 3+ add magic.

const GUARD_POOL = [
    // Elven
    {
        id: "gd_e1",
        origin: "Elven",
        name: "Leafbend Guard",
        rating: 3,
        prefix: "Elegant",
        stats: { defense: 3, speed: 2 },
    },
    {
        id: "gd_e2",
        origin: "Elven",
        name: "Moonsilver Guard",
        rating: 8,
        prefix: "Graceful",
        stats: { defense: 5, speed: 3 },
    },
    {
        id: "gd_e3",
        origin: "Elven",
        name: "Starforged Guard",
        rating: 13,
        prefix: "Radiant",
        stats: { defense: 7, speed: 4, magic: 2 },
    },
    {
        id: "gd_e4",
        origin: "Elven",
        name: "Solarbind Guard",
        rating: 18,
        prefix: "Luminous",
        stats: { defense: 9, speed: 5, magic: 4 },
    },
    {
        id: "gd_e5",
        origin: "Elven",
        name: "Celestial Ward",
        rating: 23,
        prefix: "Resplendent",
        stats: { defense: 11, speed: 6, magic: 6 },
    },
    // Human
    {
        id: "gd_h1",
        origin: "Human",
        name: "Soldier's Guard",
        rating: 3,
        prefix: "Reliable",
        stats: { defense: 4 },
    },
    {
        id: "gd_h2",
        origin: "Human",
        name: "Tempered Crossguard",
        rating: 8,
        prefix: "Balanced",
        stats: { defense: 6 },
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
        stats: { defense: 10, attack: 4 },
    },
    {
        id: "gd_h5",
        origin: "Human",
        name: "Grandmaster's Guard",
        rating: 23,
        prefix: "Indomitable",
        stats: { defense: 12, attack: 6 },
    },
];

// ── Sword Family ──────────────────────────────────────────────────────────────

// Dagger blades
// Human: attack-focused, no magic, no speed on tier 1-3, speed on tier 4-5, defense on tier 4-5
// Elven: attack + speed, magic on tier 3+, no defense

const DAGGER_BLADES = [
    // Elven
    {
        id: "db_e1",
        origin: "Elven",
        name: "Elven Fang",
        rating: 3,
        stats: { attack: 6, speed: 3 },
    },
    {
        id: "db_e2",
        origin: "Elven",
        name: "Moonpiercer",
        rating: 8,
        stats: { attack: 12, speed: 5 },
    },
    {
        id: "db_e3",
        origin: "Elven",
        name: "Silverfang",
        rating: 13,
        stats: { attack: 18, speed: 7, magic: 3 },
    },
    {
        id: "db_e4",
        origin: "Elven",
        name: "Dawnwhisper",
        rating: 18,
        stats: { attack: 24, speed: 9, magic: 5 },
    },
    {
        id: "db_e5",
        origin: "Elven",
        name: "Celestial Fang",
        rating: 23,
        stats: { attack: 30, speed: 11, magic: 7 },
    },
    // Human
    {
        id: "db_h1",
        origin: "Human",
        name: "Soldier's Knife",
        rating: 3,
        stats: { attack: 7 },
    },
    {
        id: "db_h2",
        origin: "Human",
        name: "Tempered Dagger",
        rating: 8,
        stats: { attack: 14 },
    },
    {
        id: "db_h3",
        origin: "Human",
        name: "Knight's Dirk",
        rating: 13,
        stats: { attack: 20 },
    },
    {
        id: "db_h4",
        origin: "Human",
        name: "Fine Steel Dagger",
        rating: 18,
        stats: { attack: 26, speed: 4, defense: 4 },
    },
    {
        id: "db_h5",
        origin: "Human",
        name: "Champion's Blade",
        rating: 23,
        stats: { attack: 32, speed: 6, defense: 6 },
    },
];

// Dagger crossguards
// Human: defense + speed. No magic.
// Elven: speed. Tier 3+ add magic.

const DAGGER_CROSSGUARDS = [
    // Elven
    {
        id: "dc_e1",
        origin: "Elven",
        name: "Leaf Quillon",
        rating: 3,
        prefix: "Keen",
        stats: { speed: 3 },
    },
    {
        id: "dc_e2",
        origin: "Elven",
        name: "Moonsilver Quillon",
        rating: 8,
        prefix: "Sharp",
        stats: { speed: 5 },
    },
    {
        id: "dc_e3",
        origin: "Elven",
        name: "Starforged Quillon",
        rating: 13,
        prefix: "Piercing",
        stats: { speed: 7, magic: 2 },
    },
    {
        id: "dc_e4",
        origin: "Elven",
        name: "Dawnedge Quillon",
        rating: 18,
        prefix: "Arcane",
        stats: { speed: 9, magic: 4 },
    },
    {
        id: "dc_e5",
        origin: "Elven",
        name: "Celestial Quillon",
        rating: 23,
        prefix: "Ethereal",
        stats: { speed: 11, magic: 6 },
    },
    // Human
    {
        id: "dc_h1",
        origin: "Human",
        name: "Soldier's Quillon",
        rating: 3,
        prefix: "Reliable",
        stats: { defense: 2, speed: 1 },
    },
    {
        id: "dc_h2",
        origin: "Human",
        name: "Tempered Crossguard",
        rating: 8,
        prefix: "Balanced",
        stats: { defense: 4, speed: 2 },
    },
    {
        id: "dc_h3",
        origin: "Human",
        name: "Knight's Quillon",
        rating: 13,
        prefix: "True",
        stats: { defense: 5, speed: 3 },
    },
    {
        id: "dc_h4",
        origin: "Human",
        name: "Fine Steel Guard",
        rating: 18,
        prefix: "Steadfast",
        stats: { defense: 7, speed: 4 },
    },
    {
        id: "dc_h5",
        origin: "Human",
        name: "Grandmaster's Quillon",
        rating: 23,
        prefix: "Stalwart",
        stats: { defense: 9, speed: 5 },
    },
];

// Sword blades
// Human: attack-focused, defense on all tiers (swords are defensive), no magic, no speed on tier 1-3, speed on tier 4-5
// Elven: attack + speed, magic on tier 3+, no defense

const SWORD_BLADES = [
    // Elven
    {
        id: "sw_e1",
        origin: "Elven",
        name: "Moonblade",
        rating: 3,
        stats: { attack: 8, speed: 2 },
    },
    {
        id: "sw_e2",
        origin: "Elven",
        name: "Starfang",
        rating: 8,
        stats: { attack: 15, speed: 3 },
    },
    {
        id: "sw_e3",
        origin: "Elven",
        name: "Dawnedge",
        rating: 13,
        stats: { attack: 22, speed: 4, magic: 4 },
    },
    {
        id: "sw_e4",
        origin: "Elven",
        name: "Celestial Blade",
        rating: 18,
        stats: { attack: 29, speed: 5, magic: 7 },
    },
    {
        id: "sw_e5",
        origin: "Elven",
        name: "Aurora Edge",
        rating: 23,
        stats: { attack: 36, speed: 6, magic: 10 },
    },
    // Human
    {
        id: "sw_h1",
        origin: "Human",
        name: "Soldier's Blade",
        rating: 3,
        stats: { attack: 9, defense: 2 },
    },
    {
        id: "sw_h2",
        origin: "Human",
        name: "Tempered Blade",
        rating: 8,
        stats: { attack: 16, defense: 4 },
    },
    {
        id: "sw_h3",
        origin: "Human",
        name: "Knight's Blade",
        rating: 13,
        stats: { attack: 22, defense: 6 },
    },
    {
        id: "sw_h4",
        origin: "Human",
        name: "Fine Steel Sword",
        rating: 18,
        stats: { attack: 28, defense: 8, speed: 3 },
    },
    {
        id: "sw_h5",
        origin: "Human",
        name: "Champion's Edge",
        rating: 23,
        stats: { attack: 34, defense: 10, speed: 5 },
    },
];

// Longsword blades
// Human: attack + defense, speed on tier 4-5, no magic
// Elven: attack + speed, magic on tier 3+, no defense

const LONGSWORD_BLADES = [
    // Elven
    {
        id: "ls_e1",
        origin: "Elven",
        name: "Whisper",
        rating: 3,
        stats: { attack: 10, speed: 2 },
    },
    {
        id: "ls_e2",
        origin: "Elven",
        name: "Moonshard",
        rating: 8,
        stats: { attack: 18, speed: 3 },
    },
    {
        id: "ls_e3",
        origin: "Elven",
        name: "Starweave",
        rating: 13,
        stats: { attack: 26, speed: 4, magic: 4 },
    },
    {
        id: "ls_e4",
        origin: "Elven",
        name: "Celestial Edge",
        rating: 18,
        stats: { attack: 34, speed: 5, magic: 8 },
    },
    {
        id: "ls_e5",
        origin: "Elven",
        name: "Dawnreaver",
        rating: 23,
        stats: { attack: 42, speed: 6, magic: 12 },
    },
    // Human
    {
        id: "ls_h1",
        origin: "Human",
        name: "Soldier's Longsword",
        rating: 3,
        stats: { attack: 11, defense: 3 },
    },
    {
        id: "ls_h2",
        origin: "Human",
        name: "Tempered Longsword",
        rating: 8,
        stats: { attack: 19, defense: 5 },
    },
    {
        id: "ls_h3",
        origin: "Human",
        name: "Knight's Blade",
        rating: 13,
        stats: { attack: 27, defense: 7 },
    },
    {
        id: "ls_h4",
        origin: "Human",
        name: "Fine Steel Longsword",
        rating: 18,
        stats: { attack: 35, defense: 9, speed: 3 },
    },
    {
        id: "ls_h5",
        origin: "Human",
        name: "Champion's Longsword",
        rating: 23,
        stats: { attack: 43, defense: 11, speed: 5 },
    },
];

// Greatsword blades
// Human: heavy attack + defense, no speed on tier 1-3, speed on tier 4-5, no magic
// Elven: heavy attack + speed, magic on tier 3+, no defense

const GREATSWORD_BLADES = [
    // Elven
    {
        id: "gs_e1",
        origin: "Elven",
        name: "Moonglaive",
        rating: 3,
        stats: { attack: 14, speed: 2 },
    },
    {
        id: "gs_e2",
        origin: "Elven",
        name: "Starblade",
        rating: 8,
        stats: { attack: 24, speed: 3 },
    },
    {
        id: "gs_e3",
        origin: "Elven",
        name: "Sunsever",
        rating: 13,
        stats: { attack: 34, speed: 3, magic: 5 },
    },
    {
        id: "gs_e4",
        origin: "Elven",
        name: "Celestial Reaper",
        rating: 18,
        stats: { attack: 44, speed: 4, magic: 9 },
    },
    {
        id: "gs_e5",
        origin: "Elven",
        name: "Aurora Cleaver",
        rating: 23,
        stats: { attack: 54, speed: 5, magic: 13 },
    },
    // Human
    {
        id: "gs_h1",
        origin: "Human",
        name: "Soldier's Greatsword",
        rating: 3,
        stats: { attack: 14, defense: 2 },
    },
    {
        id: "gs_h2",
        origin: "Human",
        name: "Tempered Greatsword",
        rating: 8,
        stats: { attack: 24, defense: 4 },
    },
    {
        id: "gs_h3",
        origin: "Human",
        name: "Knight's Claymore",
        rating: 13,
        stats: { attack: 34, defense: 6 },
    },
    {
        id: "gs_h4",
        origin: "Human",
        name: "Fine Steel Claymore",
        rating: 18,
        stats: { attack: 44, defense: 8, speed: 2 },
    },
    {
        id: "gs_h5",
        origin: "Human",
        name: "Grandmaster's Blade",
        rating: 23,
        stats: { attack: 54, defense: 10, speed: 4 },
    },
];

// ── Armor ─────────────────────────────────────────────────────────────────────

// Chest plates (primary armor part)
// Human: defense + maxHp, attack on tier 4-5, no speed, no magic
// Elven: defense + speed, magic on tier 3+, no attack

const CHEST_PLATES = [
    // Elven
    {
        id: "cp_e1",
        origin: "Elven",
        name: "Moonweave Breastplate",
        rating: 3,
        stats: { defense: 12, speed: 2 },
    },
    {
        id: "cp_e2",
        origin: "Elven",
        name: "Starforged Cuirass",
        rating: 8,
        stats: { defense: 20, speed: 3 },
    },
    {
        id: "cp_e3",
        origin: "Elven",
        name: "Celestial Plate",
        rating: 13,
        stats: { defense: 28, speed: 4, magic: 4 },
    },
    {
        id: "cp_e4",
        origin: "Elven",
        name: "Aurora Breastplate",
        rating: 18,
        stats: { defense: 36, speed: 5, magic: 7 },
    },
    {
        id: "cp_e5",
        origin: "Elven",
        name: "Dawnforged Cuirass",
        rating: 23,
        stats: { defense: 44, speed: 6, magic: 10 },
    },
    // Human
    {
        id: "cp_h1",
        origin: "Human",
        name: "Soldier's Breastplate",
        rating: 3,
        stats: { defense: 12, maxHp: 10 },
    },
    {
        id: "cp_h2",
        origin: "Human",
        name: "Knight's Cuirass",
        rating: 8,
        stats: { defense: 20, maxHp: 18 },
    },
    {
        id: "cp_h3",
        origin: "Human",
        name: "Champion's Plate",
        rating: 13,
        stats: { defense: 28, maxHp: 26 },
    },
    {
        id: "cp_h4",
        origin: "Human",
        name: "Grandmaster's Cuirass",
        rating: 18,
        stats: { defense: 36, maxHp: 34, attack: 4 },
    },
    {
        id: "cp_h5",
        origin: "Human",
        name: "Grand Champion's Plate",
        rating: 23,
        stats: { defense: 44, maxHp: 42, attack: 7 },
    },
];

// Pauldrons (secondary armor part — exception: keeps attack at tier 4-5 for Human)
// Human: defense + maxHp, attack on tier 4-5
// Elven: defense + speed, magic on tier 3+

const PAULDRONS = [
    // Elven
    {
        id: "pa_e1",
        origin: "Elven",
        name: "Moonsilver Pauldrons",
        rating: 3,
        prefix: "Lithe",
        stats: { defense: 5, speed: 2 },
    },
    {
        id: "pa_e2",
        origin: "Elven",
        name: "Starweave Pauldrons",
        rating: 8,
        prefix: "Graceful",
        stats: { defense: 8, speed: 3 },
    },
    {
        id: "pa_e3",
        origin: "Elven",
        name: "Celestial Shoulders",
        rating: 13,
        prefix: "Flowing",
        stats: { defense: 11, speed: 4, magic: 2 },
    },
    {
        id: "pa_e4",
        origin: "Elven",
        name: "Aurora Pauldrons",
        rating: 18,
        prefix: "Radiant",
        stats: { defense: 14, speed: 5, magic: 4 },
    },
    {
        id: "pa_e5",
        origin: "Elven",
        name: "Dawnweave Shoulders",
        rating: 23,
        prefix: "Resplendent",
        stats: { defense: 17, speed: 6, magic: 6 },
    },
    // Human
    {
        id: "pa_h1",
        origin: "Human",
        name: "Iron Pauldrons",
        rating: 3,
        prefix: "Reliable",
        stats: { defense: 5, maxHp: 4 },
    },
    {
        id: "pa_h2",
        origin: "Human",
        name: "Soldier's Pauldrons",
        rating: 8,
        prefix: "Steadfast",
        stats: { defense: 8, maxHp: 7 },
    },
    {
        id: "pa_h3",
        origin: "Human",
        name: "Knight's Pauldrons",
        rating: 13,
        prefix: "Balanced",
        stats: { defense: 11, maxHp: 10 },
    },
    {
        id: "pa_h4",
        origin: "Human",
        name: "Champion's Pauldrons",
        rating: 18,
        prefix: "Noble",
        stats: { defense: 14, maxHp: 13, attack: 3 },
    },
    {
        id: "pa_h5",
        origin: "Human",
        name: "Grandmaster's Shoulders",
        rating: 23,
        prefix: "Stalwart",
        stats: { defense: 17, maxHp: 16, attack: 5 },
    },
];

// Armor linings (secondary — no attack for either origin)
// Human: defense + maxHp, no speed, no magic
// Elven: defense + speed, magic on tier 3+

const ARMOR_LININGS = [
    // Elven
    {
        id: "al_e1",
        origin: "Elven",
        name: "Moonsilk Lining",
        rating: 3,
        prefix: null,
        stats: { defense: 3, speed: 2 },
    },
    {
        id: "al_e2",
        origin: "Elven",
        name: "Starweave Padding",
        rating: 8,
        prefix: null,
        stats: { defense: 5, speed: 3 },
    },
    {
        id: "al_e3",
        origin: "Elven",
        name: "Celestial Lining",
        rating: 13,
        prefix: null,
        stats: { defense: 7, speed: 4, magic: 2 },
    },
    {
        id: "al_e4",
        origin: "Elven",
        name: "Dreamweave Lining",
        rating: 18,
        prefix: null,
        stats: { defense: 9, speed: 5, magic: 3 },
    },
    {
        id: "al_e5",
        origin: "Elven",
        name: "Aurora Padding",
        rating: 23,
        prefix: null,
        stats: { defense: 11, speed: 6, magic: 4 },
    },
    // Human
    {
        id: "al_h1",
        origin: "Human",
        name: "Wool Lining",
        rating: 3,
        prefix: null,
        stats: { defense: 3, maxHp: 3 },
    },
    {
        id: "al_h2",
        origin: "Human",
        name: "Leather Padding",
        rating: 8,
        prefix: null,
        stats: { defense: 5, maxHp: 6 },
    },
    {
        id: "al_h3",
        origin: "Human",
        name: "Chainmail Lining",
        rating: 13,
        prefix: null,
        stats: { defense: 7, maxHp: 9 },
    },
    {
        id: "al_h4",
        origin: "Human",
        name: "Tempered Padding",
        rating: 18,
        prefix: null,
        stats: { defense: 9, maxHp: 12 },
    },
    {
        id: "al_h5",
        origin: "Human",
        name: "Masterwork Lining",
        rating: 23,
        prefix: null,
        stats: { defense: 11, maxHp: 15 },
    },
];

// Armor clasps (secondary — no attack for either origin)
// Human: defense only (small values), tier 5 gets a little maxHp
// Elven: defense + speed, magic on tier 3+

const ARMOR_CLASPS = [
    // Elven
    {
        id: "ac_e1",
        origin: "Elven",
        name: "Moonsilver Clasp",
        rating: 3,
        prefix: null,
        stats: { defense: 3, speed: 1 },
    },
    {
        id: "ac_e2",
        origin: "Elven",
        name: "Starforged Buckle",
        rating: 8,
        prefix: null,
        stats: { defense: 4, speed: 2 },
    },
    {
        id: "ac_e3",
        origin: "Elven",
        name: "Celestial Clasp",
        rating: 13,
        prefix: null,
        stats: { defense: 5, speed: 3, magic: 2 },
    },
    {
        id: "ac_e4",
        origin: "Elven",
        name: "Aurora Fastening",
        rating: 18,
        prefix: null,
        stats: { defense: 6, speed: 3, magic: 3 },
    },
    {
        id: "ac_e5",
        origin: "Elven",
        name: "Dawnsilver Clasp",
        rating: 23,
        prefix: null,
        stats: { defense: 7, speed: 4, magic: 4 },
    },
    // Human
    {
        id: "ac_h1",
        origin: "Human",
        name: "Iron Buckle",
        rating: 3,
        prefix: null,
        stats: { defense: 3 },
    },
    {
        id: "ac_h2",
        origin: "Human",
        name: "Soldier's Clasp",
        rating: 8,
        prefix: null,
        stats: { defense: 4 },
    },
    {
        id: "ac_h3",
        origin: "Human",
        name: "Knight's Buckle",
        rating: 13,
        prefix: null,
        stats: { defense: 5 },
    },
    {
        id: "ac_h4",
        origin: "Human",
        name: "Champion's Clasp",
        rating: 18,
        prefix: null,
        stats: { defense: 6 },
    },
    {
        id: "ac_h5",
        origin: "Human",
        name: "Grandmaster's Fastening",
        rating: 23,
        prefix: null,
        stats: { defense: 7, maxHp: 5 },
    },
];

// Helm shells (primary armor part)
// Human: defense + maxHp, attack on tier 4-5, no speed, no magic
// Elven: defense + speed, magic on tier 3+, no attack

const HELM_SHELLS = [
    // Elven
    {
        id: "hs_e1",
        origin: "Elven",
        name: "Moonsilver Helm",
        rating: 3,
        stats: { defense: 8, speed: 1 },
    },
    {
        id: "hs_e2",
        origin: "Elven",
        name: "Starforged Helm",
        rating: 8,
        stats: { defense: 13, speed: 2 },
    },
    {
        id: "hs_e3",
        origin: "Elven",
        name: "Celestial Crown",
        rating: 13,
        stats: { defense: 18, speed: 3, magic: 4 },
    },
    {
        id: "hs_e4",
        origin: "Elven",
        name: "Aurora Helm",
        rating: 18,
        stats: { defense: 23, speed: 4, magic: 7 },
    },
    {
        id: "hs_e5",
        origin: "Elven",
        name: "Dawnforged Crown",
        rating: 23,
        stats: { defense: 28, speed: 5, magic: 10 },
    },
    // Human
    {
        id: "hs_h1",
        origin: "Human",
        name: "Iron Helm",
        rating: 3,
        stats: { defense: 8, maxHp: 6 },
    },
    {
        id: "hs_h2",
        origin: "Human",
        name: "Soldier's Helm",
        rating: 8,
        stats: { defense: 13, maxHp: 11 },
    },
    {
        id: "hs_h3",
        origin: "Human",
        name: "Knight's Helm",
        rating: 13,
        stats: { defense: 18, maxHp: 16 },
    },
    {
        id: "hs_h4",
        origin: "Human",
        name: "Champion's Helm",
        rating: 18,
        stats: { defense: 23, maxHp: 21, attack: 3 },
    },
    {
        id: "hs_h5",
        origin: "Human",
        name: "Grandmaster's Helm",
        rating: 23,
        stats: { defense: 28, maxHp: 26, attack: 5 },
    },
];

// Helm visors (secondary — no attack for either origin)
// Human: defense only, no speed, no magic
// Elven: defense + magic, speed on tier 3+

const HELM_VISORS = [
    // Elven
    {
        id: "hv_e1",
        origin: "Elven",
        name: "Moonsilver Visor",
        rating: 3,
        prefix: "Keen",
        stats: { defense: 4, magic: 2 },
    },
    {
        id: "hv_e2",
        origin: "Elven",
        name: "Starweave Visor",
        rating: 8,
        prefix: "Piercing",
        stats: { defense: 6, magic: 3 },
    },
    {
        id: "hv_e3",
        origin: "Elven",
        name: "Celestial Faceplate",
        rating: 13,
        prefix: "Vigilant",
        stats: { defense: 8, magic: 5, speed: 2 },
    },
    {
        id: "hv_e4",
        origin: "Elven",
        name: "Aurora Visor",
        rating: 18,
        prefix: "Prescient",
        stats: { defense: 10, magic: 7, speed: 3 },
    },
    {
        id: "hv_e5",
        origin: "Elven",
        name: "Dawnweave Faceplate",
        rating: 23,
        prefix: "Omniscient",
        stats: { defense: 12, magic: 9, speed: 4 },
    },
    // Human
    {
        id: "hv_h1",
        origin: "Human",
        name: "Iron Visor",
        rating: 3,
        prefix: "Reliable",
        stats: { defense: 4 },
    },
    {
        id: "hv_h2",
        origin: "Human",
        name: "Soldier's Visor",
        rating: 8,
        prefix: "Steadfast",
        stats: { defense: 6 },
    },
    {
        id: "hv_h3",
        origin: "Human",
        name: "Knight's Faceplate",
        rating: 13,
        prefix: "Resolute",
        stats: { defense: 8 },
    },
    {
        id: "hv_h4",
        origin: "Human",
        name: "Champion's Visor",
        rating: 18,
        prefix: "Dauntless",
        stats: { defense: 10 },
    },
    {
        id: "hv_h5",
        origin: "Human",
        name: "Grandmaster's Faceplate",
        rating: 23,
        prefix: "Indomitable",
        stats: { defense: 12 },
    },
];

// Helm straps (secondary — no attack for either origin)
// Human: defense + maxHp (small), no speed, no magic
// Elven: defense + speed, magic on tier 3+

const HELM_STRAPS = [
    // Elven
    {
        id: "hst_e1",
        origin: "Elven",
        name: "Moonsilk Strap",
        rating: 3,
        prefix: null,
        stats: { defense: 2, speed: 2 },
    },
    {
        id: "hst_e2",
        origin: "Elven",
        name: "Starweave Strap",
        rating: 8,
        prefix: null,
        stats: { defense: 3, speed: 3 },
    },
    {
        id: "hst_e3",
        origin: "Elven",
        name: "Celestial Strap",
        rating: 13,
        prefix: null,
        stats: { defense: 4, speed: 4, magic: 2 },
    },
    {
        id: "hst_e4",
        origin: "Elven",
        name: "Dreamweave Strap",
        rating: 18,
        prefix: null,
        stats: { defense: 5, speed: 5, magic: 3 },
    },
    {
        id: "hst_e5",
        origin: "Elven",
        name: "Aurora Strap",
        rating: 23,
        prefix: null,
        stats: { defense: 6, speed: 6, magic: 4 },
    },
    // Human
    {
        id: "hst_h1",
        origin: "Human",
        name: "Leather Strap",
        rating: 3,
        prefix: null,
        stats: { defense: 2, maxHp: 2 },
    },
    {
        id: "hst_h2",
        origin: "Human",
        name: "Reinforced Strap",
        rating: 8,
        prefix: null,
        stats: { defense: 3, maxHp: 4 },
    },
    {
        id: "hst_h3",
        origin: "Human",
        name: "Knight's Strap",
        rating: 13,
        prefix: null,
        stats: { defense: 4, maxHp: 6 },
    },
    {
        id: "hst_h4",
        origin: "Human",
        name: "Champion's Strap",
        rating: 18,
        prefix: null,
        stats: { defense: 5, maxHp: 8 },
    },
    {
        id: "hst_h5",
        origin: "Human",
        name: "Masterwork Strap",
        rating: 23,
        prefix: null,
        stats: { defense: 6, maxHp: 10 },
    },
];

// Leg plates (primary armor part)
// Human: defense + maxHp, attack on tier 4-5, no magic
// Elven: defense + speed, magic on tier 3+, no attack

const LEG_PLATES = [
    // Elven
    {
        id: "lp_e1",
        origin: "Elven",
        name: "Moonweave Greaves",
        rating: 3,
        stats: { defense: 10, speed: 3 },
    },
    {
        id: "lp_e2",
        origin: "Elven",
        name: "Starforged Greaves",
        rating: 8,
        stats: { defense: 17, speed: 4 },
    },
    {
        id: "lp_e3",
        origin: "Elven",
        name: "Celestial Greaves",
        rating: 13,
        stats: { defense: 24, speed: 5, magic: 4 },
    },
    {
        id: "lp_e4",
        origin: "Elven",
        name: "Aurora Greaves",
        rating: 18,
        stats: { defense: 31, speed: 6, magic: 7 },
    },
    {
        id: "lp_e5",
        origin: "Elven",
        name: "Dawnforged Greaves",
        rating: 23,
        stats: { defense: 38, speed: 7, magic: 10 },
    },
    // Human
    {
        id: "lp_h1",
        origin: "Human",
        name: "Iron Greaves",
        rating: 3,
        stats: { defense: 10, maxHp: 8 },
    },
    {
        id: "lp_h2",
        origin: "Human",
        name: "Soldier's Greaves",
        rating: 8,
        stats: { defense: 17, maxHp: 14 },
    },
    {
        id: "lp_h3",
        origin: "Human",
        name: "Knight's Greaves",
        rating: 13,
        stats: { defense: 24, maxHp: 20 },
    },
    {
        id: "lp_h4",
        origin: "Human",
        name: "Champion's Greaves",
        rating: 18,
        stats: { defense: 31, maxHp: 26, attack: 3 },
    },
    {
        id: "lp_h5",
        origin: "Human",
        name: "Grand Champion's Greaves",
        rating: 23,
        stats: { defense: 38, maxHp: 32, attack: 5 },
    },
];

// Knee plates (secondary — no attack for either origin)
// Human: defense + speed (knees aid mobility), no magic, no maxHp
// Elven: defense + speed, magic on tier 3+

const KNEE_PLATES = [
    // Elven
    {
        id: "kp_e1",
        origin: "Elven",
        name: "Moonsilver Poleyn",
        rating: 3,
        prefix: "Nimble",
        stats: { defense: 4, speed: 3 },
    },
    {
        id: "kp_e2",
        origin: "Elven",
        name: "Starforged Poleyn",
        rating: 8,
        prefix: "Swift",
        stats: { defense: 6, speed: 4 },
    },
    {
        id: "kp_e3",
        origin: "Elven",
        name: "Celestial Poleyn",
        rating: 13,
        prefix: "Fleet",
        stats: { defense: 8, speed: 6, magic: 2 },
    },
    {
        id: "kp_e4",
        origin: "Elven",
        name: "Aurora Poleyn",
        rating: 18,
        prefix: "Ethereal",
        stats: { defense: 10, speed: 7, magic: 4 },
    },
    {
        id: "kp_e5",
        origin: "Elven",
        name: "Dawnforged Poleyn",
        rating: 23,
        prefix: "Transcendent",
        stats: { defense: 12, speed: 9, magic: 6 },
    },
    // Human
    {
        id: "kp_h1",
        origin: "Human",
        name: "Iron Poleyn",
        rating: 3,
        prefix: "Reliable",
        stats: { defense: 4, speed: 2 },
    },
    {
        id: "kp_h2",
        origin: "Human",
        name: "Soldier's Poleyn",
        rating: 8,
        prefix: "Steadfast",
        stats: { defense: 6, speed: 3 },
    },
    {
        id: "kp_h3",
        origin: "Human",
        name: "Knight's Poleyn",
        rating: 13,
        prefix: "Balanced",
        stats: { defense: 8, speed: 4 },
    },
    {
        id: "kp_h4",
        origin: "Human",
        name: "Champion's Poleyn",
        rating: 18,
        prefix: "Stalwart",
        stats: { defense: 10, speed: 5 },
    },
    {
        id: "kp_h5",
        origin: "Human",
        name: "Grandmaster's Poleyn",
        rating: 23,
        prefix: "Indomitable",
        stats: { defense: 12, speed: 6 },
    },
];

// Leg straps (secondary — no attack for either origin)
// Human: defense + maxHp (small), no speed, no magic
// Elven: defense + speed, magic on tier 3+

const LEG_STRAPS = [
    // Elven
    {
        id: "ls2_e1",
        origin: "Elven",
        name: "Moonsilk Straps",
        rating: 3,
        prefix: null,
        stats: { defense: 3, speed: 2 },
    },
    {
        id: "ls2_e2",
        origin: "Elven",
        name: "Starweave Straps",
        rating: 8,
        prefix: null,
        stats: { defense: 4, speed: 3 },
    },
    {
        id: "ls2_e3",
        origin: "Elven",
        name: "Celestial Straps",
        rating: 13,
        prefix: null,
        stats: { defense: 5, speed: 4, magic: 2 },
    },
    {
        id: "ls2_e4",
        origin: "Elven",
        name: "Dreamweave Straps",
        rating: 18,
        prefix: null,
        stats: { defense: 6, speed: 5, magic: 3 },
    },
    {
        id: "ls2_e5",
        origin: "Elven",
        name: "Aurora Straps",
        rating: 23,
        prefix: null,
        stats: { defense: 7, speed: 6, magic: 4 },
    },
    // Human
    {
        id: "ls2_h1",
        origin: "Human",
        name: "Leather Straps",
        rating: 3,
        prefix: null,
        stats: { defense: 3, maxHp: 3 },
    },
    {
        id: "ls2_h2",
        origin: "Human",
        name: "Soldier's Straps",
        rating: 8,
        prefix: null,
        stats: { defense: 4, maxHp: 5 },
    },
    {
        id: "ls2_h3",
        origin: "Human",
        name: "Knight's Straps",
        rating: 13,
        prefix: null,
        stats: { defense: 5, maxHp: 7 },
    },
    {
        id: "ls2_h4",
        origin: "Human",
        name: "Champion's Straps",
        rating: 18,
        prefix: null,
        stats: { defense: 6, maxHp: 9 },
    },
    {
        id: "ls2_h5",
        origin: "Human",
        name: "Masterwork Straps",
        rating: 23,
        prefix: null,
        stats: { defense: 7, maxHp: 11 },
    },
];

// ── Weapon Definitions ────────────────────────────────────────────────────────
// slots[0] is always the primary (locks origin). The rest are weighted.

const WEAPON_DEFINITIONS = {
    sword: {
        label: "Sword",
        slots: [
            { key: "blade", label: "Blade", pool: SWORD_BLADES },
            { key: "guard", label: "Guard", pool: GUARD_POOL },
            { key: "grip", label: "Grip", pool: GRIP_POOL },
            { key: "pommel", label: "Pommel", pool: POMMEL_POOL },
        ],
    },
    dagger: {
        label: "Dagger",
        slots: [
            { key: "blade", label: "Blade", pool: DAGGER_BLADES },
            { key: "crossguard", label: "Crossguard", pool: DAGGER_CROSSGUARDS },
            { key: "grip", label: "Grip", pool: GRIP_POOL },
            { key: "pommel", label: "Pommel", pool: POMMEL_POOL },
        ],
    },
    longsword: {
        label: "Long Sword",
        slots: [
            { key: "blade", label: "Blade", pool: LONGSWORD_BLADES },
            { key: "guard", label: "Guard", pool: GUARD_POOL },
            { key: "grip", label: "Grip", pool: GRIP_POOL },
            { key: "pommel", label: "Pommel", pool: POMMEL_POOL },
        ],
    },
    greatsword: {
        label: "Great Sword",
        slots: [
            { key: "blade", label: "Blade", pool: GREATSWORD_BLADES },
            { key: "guard", label: "Guard", pool: GUARD_POOL },
            { key: "grip", label: "Grip", pool: GRIP_POOL },
            { key: "pommel", label: "Pommel", pool: POMMEL_POOL },
        ],
    },
    chest: {
        label: "Chest",
        slots: [
            { key: "plate", label: "Plate", pool: CHEST_PLATES },
            { key: "pauldrons", label: "Pauldrons", pool: PAULDRONS },
            { key: "lining", label: "Lining", pool: ARMOR_LININGS },
            { key: "clasp", label: "Clasp", pool: ARMOR_CLASPS },
        ],
    },
    helm: {
        label: "Helm",
        slots: [
            { key: "shell", label: "Shell", pool: HELM_SHELLS },
            { key: "visor", label: "Visor", pool: HELM_VISORS },
            { key: "lining", label: "Lining", pool: ARMOR_LININGS },
            { key: "strap", label: "Strap", pool: HELM_STRAPS },
        ],
    },
    legs: {
        label: "Legs",
        slots: [
            { key: "plate", label: "Plate", pool: LEG_PLATES },
            { key: "kneeplate", label: "Kneeplate", pool: KNEE_PLATES },
            { key: "lining", label: "Lining", pool: ARMOR_LININGS },
            { key: "straps", label: "Straps", pool: LEG_STRAPS },
        ],
    },
};

export const WEAPON_TYPES = Object.entries(WEAPON_DEFINITIONS).map(
    ([id, def]) => ({ id, label: def.label }),
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function weightedRandom(weightedItems) {
    const total = weightedItems.reduce((sum, x) => sum + x.weight, 0);
    let r = Math.random() * total;
    for (const { item, weight } of weightedItems) {
        r -= weight;
        if (r <= 0) return item;
    }
    return weightedItems[weightedItems.length - 1].item;
}

// Map a part rating (1–25) to tier index 0–4 for weight lookup.
function ratingToTierIndex(rating) {
    return Math.min(4, Math.floor((rating - 1) / 5));
}

function pickPart(pool, lockedOrigin, primaryRating, allowCrossOrigin) {
    const weighted = pool.map((part) => {
        const isCross = part.origin !== null && part.origin !== lockedOrigin;
        if (isCross && !allowCrossOrigin) return { item: part, weight: 0 };
        const originWeight = part.origin === null ? 30 : isCross ? 10 : 60;
        const diff = Math.abs(part.rating - primaryRating);
        return { item: part, weight: originWeight * ratingProximityWeight(diff) };
    });
    return weightedRandom(weighted);
}

function buildName(primaryPart, otherParts) {
    const prefix =
        [...otherParts]
            .filter((p) => p.prefix)
            .sort((a, b) => b.rating - a.rating)[0]?.prefix ?? null;
    return prefix ? `${prefix} ${primaryPart.name}` : primaryPart.name;
}

function mergeStats(...parts) {
    const stats = {};
    for (const part of parts) {
        for (const [key, val] of Object.entries(part.stats)) {
            stats[key] = (stats[key] ?? 0) + val;
        }
    }
    return stats;
}

const LOG_SCALING_FACTOR = 2;

// Stats that represent fixed item characteristics, not power that scales with level.
const UNSCALED_STATS = new Set(["speed"]);

function scaleStats(stats, level) {
    const multiplier = 1 + Math.log(level + 1) * LOG_SCALING_FACTOR;
    const scaled = {};
    for (const [key, val] of Object.entries(stats)) {
        if (UNSCALED_STATS.has(key)) { scaled[key] = val; continue; }
        // Negative stats (e.g. penalties) scale toward zero, not further negative.
        if (val < 0) scaled[key] = Math.ceil(val / multiplier);
        else scaled[key] = Math.round(val * multiplier);
    }
    return scaled;
}

function resolveOrigin(parts) {
    const counts = {};
    for (const part of parts) {
        if (part.origin) counts[part.origin] = (counts[part.origin] ?? 0) + 1;
    }
    if (Object.keys(counts).length === 0) return "Neutral";
    const [dominant, count] = Object.entries(counts).sort(
        (a, b) => b[1] - a[1],
    )[0];
    return count >= 3 ? dominant : `Mixed (${dominant})`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateWeapon(type, level = 1) {
    const def = WEAPON_DEFINITIONS[type];
    if (!def) throw new Error(`Unknown weapon type: ${type}`);

    const [primarySlot, ...secondarySlots] = def.slots;
    const primaryPart = weightedRandom(
        primarySlot.pool.map((part) => ({
            item: part,
            weight: PRIMARY_TIER_WEIGHTS[ratingToTierIndex(part.rating)] ?? 1,
        })),
    );
    const lockedOrigin = primaryPart.origin;

    const parts = { [primarySlot.key]: primaryPart };
    const secondaryParts = [];
    let hasCrossOriginPart = false;
    for (const slot of secondarySlots) {
        const part = pickPart(
            slot.pool,
            lockedOrigin,
            primaryPart.rating,
            !hasCrossOriginPart,
        );
        if (part.origin !== null && part.origin !== lockedOrigin)
            hasCrossOriginPart = true;
        parts[slot.key] = part;
        secondaryParts.push(part);
    }

    const allParts = [primaryPart, ...secondaryParts];
    const totalRating = allParts.reduce((sum, p) => sum + p.rating, 0);

    return {
        type,
        typeLabel: def.label,
        name: buildName(primaryPart, secondaryParts),
        origin: resolveOrigin(allParts),
        rarity: calcRarity(totalRating),
        totalRating,
        level,
        stats: scaleStats(mergeStats(...allParts), level),
        baseStats: mergeStats(...allParts),
        slots: def.slots.map((s) => ({ key: s.key, label: s.label })),
        parts,
    };
}

export const generateSword = () => generateWeapon("longsword");

export function rescaleWeapon(weapon, level) {
    return { ...weapon, level, stats: scaleStats(weapon.baseStats, level) };
}
