import { prisma } from "../lib/prisma.js";

const MSG_SELECT = {
    id: true,
    senderUsername: true,
    isFromAdmin: true,
    text: true,
    createdAt: true,
};

async function getThreadMessages(threadUserId) {
    return prisma.dMMessage.findMany({
        where: { threadUserId },
        orderBy: { createdAt: "asc" },
        select: MSG_SELECT,
    });
}

async function getAllThreads() {
    // Get all distinct threadUserIds with their last message
    const threads = await prisma.dMMessage.findMany({
        distinct: ["threadUserId"],
        orderBy: { createdAt: "desc" },
        select: {
            threadUserId: true,
            text: true,
            createdAt: true,
            threadUser: { select: { username: true } },
        },
    });

    // Get unread counts (messages from users not yet replied to — isFromAdmin: false)
    const unreadCounts = await prisma.dMMessage.groupBy({
        by: ["threadUserId"],
        where: { isFromAdmin: false },
        _count: { id: true },
    });

    const unreadMap = Object.fromEntries(
        unreadCounts.map((u) => [u.threadUserId, u._count.id])
    );

    return threads.map((t) => ({
        userId: t.threadUserId,
        username: t.threadUser.username,
        lastMessage: t.text,
        updatedAt: t.createdAt,
        unreadCount: unreadMap[t.threadUserId] ?? 0,
    }));
}

async function createMessage({ threadUserId, senderId, senderUsername, isFromAdmin, text }) {
    return prisma.dMMessage.create({
        data: { threadUserId, senderId, senderUsername, isFromAdmin, text },
        select: MSG_SELECT,
    });
}

async function getLastUserMessage(threadUserId) {
    return prisma.dMMessage.findFirst({
        where: { threadUserId, isFromAdmin: false },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
    });
}

async function deleteMessage(id) {
    return prisma.dMMessage.delete({ where: { id } });
}

async function getMessage(id) {
    return prisma.dMMessage.findUnique({ where: { id } });
}

export default {
    getThreadMessages,
    getAllThreads,
    createMessage,
    getLastUserMessage,
    deleteMessage,
    getMessage,
};
