import { prisma } from "../lib/prisma.js";

async function getGames(req, res) {
    const games = await prisma.fmGame.findMany({
        orderBy: { updatedAt: "desc" },
    });
    res.json(games);
}

// Called by FileMaker on record commit — marks synced: true
async function upsertGame(req, res) {
    const { primaryKey, title, description, creationTimestamp } = req.body;

    if (!primaryKey || !title) {
        return res.status(400).json({ error: "primaryKey and title are required" });
    }

    const game = await prisma.fmGame.upsert({
        where: { id: primaryKey },
        update: { title, description, creationTimestamp, synced: true },
        create: { id: primaryKey, title, description, creationTimestamp, synced: true },
    });

    console.log(`FM upsert: ${title} (${primaryKey})`);
    res.json({ ok: true, game });
}

// Called by web UI — creates record with synced: false for FileMaker to pick up
async function createFromWeb(req, res) {
    const { id, title, description } = req.body;

    if (!id || !title) {
        return res.status(400).json({ error: "id and title are required" });
    }

    const game = await prisma.fmGame.create({
        data: { id, title, description, synced: false },
    });

    console.log(`Web create: ${title} (${id})`);
    res.json({ ok: true, game });
}

// Polled by FileMaker timer script
async function getPending(req, res) {
    const pending = await prisma.fmGame.findMany({
        where: { synced: false },
    });
    res.json(pending);
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

export default { getGames, upsertGame, createFromWeb, getPending, deleteGame };
