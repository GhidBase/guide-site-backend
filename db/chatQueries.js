import { prisma } from "../lib/prisma.js";

async function getChatMessages(gameId, limit = 100) {
    const messages = await prisma.chatMessage.findMany({
        where: { gameId },
        orderBy: { createdAt: "asc" },
        take: limit,
        select: { id: true, userId: true, username: true, text: true, type: true, createdAt: true, user: { select: { role: true } } },
    });
    return messages.map(({ user, ...m }) => ({ ...m, userRole: user.role }));
}

async function createChatMessage({ gameId, userId, username, text, type = "message" }) {
    const message = await prisma.chatMessage.create({
        data: { gameId, userId, username, text, type },
        select: { id: true, userId: true, username: true, text: true, type: true, createdAt: true, user: { select: { role: true } } },
    });
    const { user, ...rest } = message;
    return { ...rest, userRole: user.role };
}

async function getChatMessage(id) {
    return prisma.chatMessage.findUnique({ where: { id } });
}

async function deleteChatMessage(id) {
    return prisma.chatMessage.delete({ where: { id } });
}

export default { getChatMessages, createChatMessage, getChatMessage, deleteChatMessage };
