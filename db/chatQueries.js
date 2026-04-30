import { prisma } from "../lib/prisma.js";

async function getChatMessages(gameId, limit = 100) {
    return prisma.chatMessage.findMany({
        where: { gameId },
        orderBy: { createdAt: "asc" },
        take: limit,
        select: { id: true, userId: true, username: true, text: true, type: true, createdAt: true },
    });
}

async function createChatMessage({ gameId, userId, username, text, type = "message" }) {
    return prisma.chatMessage.create({
        data: { gameId, userId, username, text, type },
        select: { id: true, userId: true, username: true, text: true, type: true, createdAt: true },
    });
}

async function getChatMessage(id) {
    return prisma.chatMessage.findUnique({ where: { id } });
}

async function deleteChatMessage(id) {
    return prisma.chatMessage.delete({ where: { id } });
}

export default { getChatMessages, createChatMessage, getChatMessage, deleteChatMessage };
