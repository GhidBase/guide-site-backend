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
    const { enemyId, kills, durationSeconds } = req.body;

    if (!enemyId || typeof kills !== "number" || typeof durationSeconds !== "number") {
        return res.status(400).json({ error: "enemyId, kills, and durationSeconds are required" });
    }
    if (kills < 0 || durationSeconds <= 0) {
        return res.status(400).json({ error: "Invalid kills or duration" });
    }

    try {
        const result = await db.processTick(req.user.id, { enemyId, kills, durationSeconds });
        res.json(result);
    } catch (err) {
        if (err.message === "Character not found" || err.message === "Enemy not found") {
            return res.status(404).json({ error: err.message });
        }
        if (err.message === "Enemy not in current zone") {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
}

async function equip(req, res) {
    const inventoryItemId = +req.params.inventoryItemId;
    const { equipped } = req.body;

    if (typeof equipped !== "boolean") {
        return res.status(400).json({ error: "equipped (boolean) is required" });
    }

    try {
        const character = await db.equipItem(req.user.id, inventoryItemId, equipped);
        res.json(character);
    } catch (err) {
        if (err.message === "Character not found" || err.message === "Item not found in inventory") {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
}

async function changeZone(req, res) {
    const { zone } = req.body;
    if (!zone) {
        return res.status(400).json({ error: "zone is required" });
    }

    try {
        const character = await db.changeZone(req.user.id, zone);
        res.json(character);
    } catch (err) {
        if (err.message === "Invalid zone") {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
}

async function getEnemies(req, res) {
    const { zone } = req.query;
    if (!zone) {
        return res.status(400).json({ error: "zone query param is required" });
    }

    try {
        const enemies = await db.getEnemiesForZone(zone);
        res.json(enemies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getZones(req, res) {
    try {
        const zones = await db.getZones();
        res.json(zones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export default { getCharacter, tick, equip, changeZone, getEnemies, getZones };
