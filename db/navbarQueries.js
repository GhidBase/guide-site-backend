import { prisma } from "../lib/prisma.js";

export async function getGames() {
    return await prisma.game.findMany();
}

export async function updateNavbarData(navbarData) {
    const result = await prisma.game.update({
        where: {
            id: 1, // temporary for LDG
        },
        data: {
            navbar: navbarData,
        },
    });
}

export async function getMapData() {
    return await prisma.game.findMany({
        include: {
            sections: {
                include: {
                    pages: true,
                },
            },
        },
    });
}

async function getAllSections() {
    return await prisma.section.findMany();
}

async function getSectionsByGameId(gameId) {
    if (gameId === null) return [];
    const sections = await prisma.section.findMany({
        where: { gameId },
        include: {
            pages: {
                include: {
                    claimedBy: { select: { id: true, username: true } },
                },
            },
        },
        orderBy: { order: "asc" },
    });
    return sections;
}

export default {
    getSectionsByGameId,
    getAllSections,
};
