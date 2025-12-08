import { prisma } from "../lib/prisma.js";

async function getGames() {
    return await prisma.game.findMany();
}

async function createGame(title) {
    return await prisma.game.create({
        data: {
            title,
        },
    });
}

async function getChecklists(gameId) {
    return await prisma.checklist.findMany({
        where: {
            gameId,
        },
    });
}

async function createChecklist(title, gameId) {
    return await prisma.checklist.create({
        data: {
            title,
            gameId,
        },
    });
}

async function getChecklistItems(checklistId) {
    return await prisma.checklistItem.findMany({
        where: {
            checklistId,
        },
    });
}

export default {
    getGames,
    createGame,
    createChecklist,
    getChecklists,
    getChecklistItems,
};
