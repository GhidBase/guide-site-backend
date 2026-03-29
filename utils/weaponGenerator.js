import { SWORD_DEFINITIONS } from './pools/swords.js';
import { ARMOR_DEFINITIONS } from './pools/armor.js';

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

// ── Weapon Definitions ────────────────────────────────────────────────────────

const WEAPON_DEFINITIONS = { ...SWORD_DEFINITIONS, ...ARMOR_DEFINITIONS };

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

export function rescaleWeapon(weapon, level) {
    return { ...weapon, level, stats: scaleStats(weapon.baseStats, level) };
}
