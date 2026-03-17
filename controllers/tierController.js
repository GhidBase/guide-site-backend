import db from "../db/tierQueries.js";

// ── Categories ────────────────────────────────────────────────────────────────

export async function getTierCategories(req, res) {
    const gameId = +req.params.gameId;
    res.json(await db.getTierCategories(gameId));
}

export async function getTierCategory(req, res) {
    const id = +req.params.id;
    const category = await db.getTierCategoryFull(id);
    if (!category) return res.status(404).json({ error: "Not found" });
    res.json(category);
}

export async function createTierCategory(req, res) {
    const gameId = +req.params.gameId;
    const { name, order } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    res.status(201).json(await db.createTierCategory({ gameId, name, order: order ?? 0 }));
}

export async function deleteTierCategory(req, res) {
    await db.deleteTierCategory(+req.params.id);
    res.json({ message: "Deleted" });
}

// ── Items ─────────────────────────────────────────────────────────────────────

export async function createTierItem(req, res) {
    const categoryId = +req.params.categoryId;
    const { name, imageUrl, order } = req.body;
    if (!name || !imageUrl) return res.status(400).json({ error: "name and imageUrl are required" });
    res.status(201).json(await db.createTierItem({ categoryId, name, imageUrl, order: order ?? 0 }));
}

export async function deleteTierItem(req, res) {
    await db.deleteTierItem(+req.params.itemId);
    res.json({ message: "Deleted" });
}

// ── Modes ─────────────────────────────────────────────────────────────────────

export async function createTierMode(req, res) {
    const categoryId = +req.params.categoryId;
    const { name, color, order } = req.body;
    if (!name || !color) return res.status(400).json({ error: "name and color are required" });
    res.status(201).json(await db.createTierMode({ categoryId, name, color, order: order ?? 0 }));
}

export async function deleteTierMode(req, res) {
    await db.deleteTierMode(+req.params.modeId);
    res.json({ message: "Deleted" });
}

// ── Tiers ─────────────────────────────────────────────────────────────────────

export async function createTierTier(req, res) {
    const modeId = +req.params.modeId;
    const { name, color, order } = req.body;
    if (!name || !color) return res.status(400).json({ error: "name and color are required" });
    res.status(201).json(await db.createTierTier({ modeId, name, color, order: order ?? 0 }));
}

export async function updateTierTier(req, res) {
    const id = +req.params.tierId;
    const { order, name, color } = req.body;
    res.json(await db.updateTierTier({ id, order: order !== undefined ? +order : undefined, name, color }));
}

export async function deleteTierTier(req, res) {
    await db.deleteTierTier(+req.params.tierId);
    res.json({ message: "Deleted" });
}

// ── Entries ───────────────────────────────────────────────────────────────────

export async function createTierEntry(req, res) {
    const modeId = +req.params.modeId;
    const { tierId, itemId } = req.body;
    if (!tierId || !itemId) return res.status(400).json({ error: "tierId and itemId are required" });
    const existing = await db.getTierEntriesInMode({ modeId, itemId: +itemId });
    if (existing) return res.status(409).json({ error: "Item already placed in this mode" });
    res.status(201).json(await db.createTierEntry({ modeId, tierId: +tierId, itemId: +itemId }));
}

export async function deleteTierEntry(req, res) {
    await db.deleteTierEntry(+req.params.entryId);
    res.json({ message: "Deleted" });
}
