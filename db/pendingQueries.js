import { prisma } from "../lib/prisma.js";

async function createPendingBlock({
    blockId,
    content,
    type,
    userId,
    operation,
}) {
    return await prisma.pendingBlock.create({
        data: {
            blockId,
            content,
            type,
            userId,
            operation,
        },
    });
}

async function getPendingBlock(id) {
    return await prisma.pendingBlock.findUnique({
        where: { id },
        include: {
            block: true,
            user: true,
            reviewer: true,
        },
    });
}

async function getPendingBlocks(status = "PENDING") {
    return await prisma.pendingBlock.findMany({
        where: { status },
        include: {
            block: true,
            user: true,
            reviewer: true,
        },
    });
}

async function updatePendingBlock(id, data) {
    return await prisma.pendingBlock.update({
        where: { id },
        data,
    });
}

async function deletePendingBlock(id) {
    return await prisma.pendingBlock.delete({
        where: { id },
    });
}

export default {
    createPendingBlock,
    getPendingBlock,
    getPendingBlocks,
    updatePendingBlock,
    deletePendingBlock,
};
