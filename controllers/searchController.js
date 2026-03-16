import { searchPages } from "../db/searchQueries.js";

export async function search(req, res) {
    const { q, gameId } = req.query;

    if (!q || q.trim().length < 2) return res.json([]);

    try {
        const results = await searchPages(q.trim(), gameId ?? null);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Search failed" });
    }
}
