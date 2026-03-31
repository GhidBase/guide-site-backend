import * as db from "../db/idleQueries.js";

async function getCharacter(req, res) {
    try {
        const { character, offlineGains } = await db.getOrCreateCharacter(req.user.id);
        res.json({ character, offlineGains });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function tick(req, res) {
    const { kills, durationSeconds } = req.body;

    if (typeof kills !== "number" || typeof durationSeconds !== "number") {
        return res.status(400).json({ error: "kills and durationSeconds are required" });
    }
    if (kills < 0 || durationSeconds <= 0) {
        return res.status(400).json({ error: "Invalid kills or duration" });
    }

    try {
        const result = await db.processTick(req.user.id, { kills, durationSeconds });
        res.json(result);
    } catch (err) {
        if (err.message === "Character not found") {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
}

async function equip(req, res) {
    const inventoryItemId = +req.params.inventoryItemId;
    const { equipped, source } = req.body;

    if (typeof equipped !== "boolean") {
        return res.status(400).json({ error: "equipped (boolean) is required" });
    }

    try {
        const character = await db.equipItem(req.user.id, inventoryItemId, { equipped, source });
        res.json(character);
    } catch (err) {
        if (err.message === "Character not found" || err.message === "Item not found in inventory" || err.message === "Weapon not found") {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
}

async function changeFloor(req, res) {
    const { world, floor } = req.body;
    if (!world || floor === undefined || floor === null) {
        return res.status(400).json({ error: "world and floor are required" });
    }

    try {
        const character = await db.changeFloor(req.user.id, { world, floor });
        res.json(character);
    } catch (err) {
        if (err.message === "Invalid world" || err.message === "Floor not unlocked" || err.message === "Invalid floor") {
            return res.status(400).json({ error: err.message });
        }
        if (err.message === "Character not found") {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
}

async function getEnemies(req, res) {
    const { world } = req.query;
    if (!world) {
        return res.status(400).json({ error: "world query param is required" });
    }

    try {
        const enemies = await db.getEnemiesForWorld(world);
        res.json(enemies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getWorlds(req, res) {
    try {
        const worlds = await db.getWorlds();
        res.json(worlds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function discardMany(req, res) {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "items array is required" });
    }
    try {
        const character = await db.discardMany(req.user.id, items);
        res.json(character);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function discard(req, res) {
    const itemId = +req.params.itemId;
    const { source } = req.body;

    if (!source) return res.status(400).json({ error: "source is required" });

    try {
        const character = await db.discardItem(req.user.id, itemId, source);
        res.json(character);
    } catch (err) {
        if (err.message.includes("not found")) return res.status(404).json({ error: err.message });
        res.status(500).json({ error: err.message });
    }
}

async function reset(req, res) {
    try {
        const character = await db.resetCharacter(req.user.id);
        res.json(character);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function revive(req, res) {
    try {
        const character = await db.reviveCharacter(req.user.id);
        res.json(character);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export default { getCharacter, tick, equip, discard, discardMany, changeFloor, getEnemies, getWorlds, reset, revive };
