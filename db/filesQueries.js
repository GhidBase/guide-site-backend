import { prisma } from "../lib/prisma.js";

async function createFile({
    title,
    url,
    filename,
    blockId,
    status = "PENDING_UPLOAD",
}) {
    return await prisma.file.create({
        data: { title, url, filename, blockId, status },
    });
}

// State machine validation
const VALID_TRANSITIONS = {
    PENDING_UPLOAD: ["ACTIVE", "DELETED"],
    ACTIVE: ["PENDING_DELETION", "DELETED"],
    PENDING_DELETION: ["ACTIVE", "DELETED"],
    DELETED: [],
};

async function updateFileStatus(id, newStatus) {
    const file = await getFile(id);
    if (!file) throw new Error("File not found");

    const validNext = VALID_TRANSITIONS[file.status];
    if (!validNext.includes(newStatus)) {
        throw new Error(
            `Invalid transition from ${file.status} to ${newStatus}`,
        );
    }

    return await prisma.file.update({
        where: { id },
        data: { status: newStatus },
    });
}

async function updateFile(id, data) {
    return await prisma.file.update({
        where: { id },
        data: { ...data },
    });
}

async function getFile(id) {
    return await prisma.file.findUnique({
        where: {
            id,
        },
    });
}

async function deleteFile(id) {
    return await prisma.file.delete({
        where: {
            id,
        },
    });
}

async function getFilesByBlock(blockId) {
    return await prisma.file.findMany({
        where: { blockId },
    });
}

async function deleteFilesByBlock(blockId) {
    return await prisma.file.deleteMany({
        where: { blockId },
    });
}

export default {
    createFile,
    deleteFile,
    getFile,
    deleteFilesByBlock,
    getFilesByBlock,
    updateFileStatus,
    updateFile,
};
