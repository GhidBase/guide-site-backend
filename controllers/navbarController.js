import { updateNavbarData, getMapData } from "../db/navbarQueries.js";

import db from "../db/navbarQueries.js";

export async function getNavbarData(req, res) {
    console.log("yo");
    try {
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ error: "Invalid navbar data" });
        }

        const navbar = req.body;
        await updateNavbarData(navbar);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "failed to store navbar" });
    }
}

export async function getMapDataFromDB(req, res) {
    console.log("fetching data...\n");
    const result = await getMapData();
    res.status(200).json(result);
}

export async function getNavbar(req, res) {
    console.log("hi");
    console.log("received get navbar request");
    try {
        const gameId = req.query.gameId ? parseInt(req.query.gameId) : null;

        const result = await db.getSectionsByGameId(gameId);
        console.log(result);
        res.json(result);
    } catch (error) {
        console.error("Failed to fetch navbar:", error);
        res.status(500).json({ error: "Failed to fetch navbar" });
    }
}
