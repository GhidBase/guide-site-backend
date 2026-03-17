import db from "../db/unitsQueries.js";

async function getUnitCategories(req, res) {
    const gameId = +req.params.gameId;
    const categories = await db.getUnitCategories(gameId);
    res.json(categories);
}

async function createUnitCategory(req, res) {
    const gameId = +req.params.gameId;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const category = await db.createUnitCategory({ name, gameId });
    res.status(201).json(category);
}

async function deleteUnitCategory(req, res) {
    const id = +req.params.id;
    await db.deleteUnitCategory(id);
    res.json({ message: "Category deleted" });
}

async function createUnit(req, res) {
    const gameId = +req.params.gameId;
    const { name, imageUrl, categoryId } = req.body;
    if (!name || !imageUrl || !categoryId) {
        return res.status(400).json({ error: "name, imageUrl, and categoryId are required" });
    }
    const unit = await db.createUnit({ name, imageUrl, categoryId: +categoryId, gameId });
    res.status(201).json(unit);
}

async function deleteUnit(req, res) {
    const id = +req.params.id;
    await db.deleteUnit(id);
    res.json({ message: "Unit deleted" });
}

export default { getUnitCategories, createUnitCategory, deleteUnitCategory, createUnit, deleteUnit };
