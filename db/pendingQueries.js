import { prisma } from "../lib/prisma.js";

async function createPendingBlock({
    blockId,
    content,
    oldContent,
    newContent,
    oldFiles,
    newFiles,
    type,
    userId,
    operation,
}) {
    return await prisma.pendingBlock.create({
        data: {
            blockId,
            content,
            oldContent,
            newContent,
            oldFiles,
            newFiles,
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
        orderBy: { createdAt: "asc" },
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

async function findPendingBlockByBlockIdAndOperation(blockId, operation) {
    return await prisma.pendingBlock.findFirst({
        where: {
            blockId,
            operation,
            status: "PENDING",
        },
    });
}

export default {
    createPendingBlock,
    getPendingBlock,
    getPendingBlocks,
    updatePendingBlock,
    deletePendingBlock,
    findPendingBlockByBlockIdAndOperation,
};
