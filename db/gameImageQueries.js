import { prisma } from "../lib/prisma.js";

async function getGameImages(gameId) {
    return await prisma.gameImage.findMany({
        where: { gameId },
        orderBy: { createdAt: "desc" },
    });
}

async function getGlobalImages() {
    return await prisma.gameImage.findMany({
        where: { gameId: null },
        orderBy: { createdAt: "desc" },
    });
}

async function createGameImage({ title, filename, url, gameId, category }) {
    return await prisma.gameImage.create({
        data: { title, filename, url, gameId, category },
    });
}

async function createGlobalImage({ title, filename, url, category }) {
    return await prisma.gameImage.create({
        data: { title, filename, url, gameId: null, category },
    });
}

async function getGameImage(id) {
    return await prisma.gameImage.findUnique({ where: { id } });
}

async function getPoolFilenameSet(filenames) {
    const rows = await prisma.gameImage.findMany({
        where: { filename: { in: filenames } },
        select: { filename: true },
    });
    return new Set(rows.map((r) => r.filename));
}

async function deleteGameImage(id) {
    return await prisma.gameImage.delete({ where: { id } });
}

export default { getGameImages, getGlobalImages, createGameImage, createGlobalImage, getGameImage, deleteGameImage, getPoolFilenameSet };
