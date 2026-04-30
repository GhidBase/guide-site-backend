import { prisma } from "../lib/prisma.js";

async function getGameEditors(gameId) {
    return prisma.gameEditor.findMany({
        where: { gameId },
        select: {
            assignedAt: true,
            user: { select: { id: true, username: true } },
        },
    });
}

async function addGameEditor(gameId, userId) {
    return prisma.gameEditor.create({
        data: { gameId, userId },
        include: { user: { select: { id: true, username: true } } },
    });
}

async function removeGameEditor(gameId, userId) {
    return prisma.gameEditor.delete({
        where: { userId_gameId: { userId, gameId } },
    });
}

async function getGameEditorUser(gameId, userId) {
    return prisma.gameEditor.findUnique({
        where: { userId_gameId: { userId, gameId } },
        include: { user: { select: { id: true, username: true } } },
    });
}

export default { getGameEditors, addGameEditor, removeGameEditor, getGameEditorUser };
