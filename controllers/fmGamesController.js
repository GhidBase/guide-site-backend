import { prisma } from "../lib/prisma.js";

async function getGames(req, res) {
    const games = await prisma.fmGame.findMany({
        orderBy: { updatedAt: "desc" },
    });
    res.json(games);
}

async function upsertGame(req, res) {
    const { primaryKey, title, description, creationTimestamp } = req.body;

    if (!primaryKey || !title) {
        return res.status(400).json({ error: "primaryKey and title are required" });
    }

    const game = await prisma.fmGame.upsert({
        where: { id: primaryKey },
        update: { title, description, creationTimestamp },
        create: { id: primaryKey, title, description, creationTimestamp },
    });

    console.log(`FM upsert: ${title} (${primaryKey})`);
    res.json({ ok: true, game });
}

async function deleteGame(req, res) {
    const { primaryKey } = req.params;

    const existing = await prisma.fmGame.findUnique({ where: { id: primaryKey } });
    if (!existing) {
        return res.status(404).json({ error: "Game not found" });
    }

    await prisma.fmGame.delete({ where: { id: primaryKey } });
    console.log(`FM delete: ${primaryKey}`);
    res.json({ ok: true });
}

export default { getGames, upsertGame, deleteGame };
