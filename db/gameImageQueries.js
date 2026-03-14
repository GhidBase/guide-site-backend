import { prisma } from "../lib/prisma.js";

async function getGameImages(gameId) {
    return await prisma.gameImage.findMany({
        where: { gameId },
        orderBy: { createdAt: "desc" },
    });
}

async function createGameImage({ title, filename, url, gameId, category }) {
    return await prisma.gameImage.create({
        data: { title, filename, url, gameId, category },
    });
}

async function getGameImage(id) {
    return await prisma.gameImage.findUnique({ where: { id } });
}

async function deleteGameImage(id) {
    return await prisma.gameImage.delete({ where: { id } });
}

export default { getGameImages, createGameImage, getGameImage, deleteGameImage };
