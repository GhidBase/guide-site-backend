import { prisma } from "../lib/prisma.js";

async function createFile({ title, url, filename, blockId }) {
    return await prisma.file.create({
        data: { title, url, filename, blockId },
    });
}

async function getFile(id) {
    return await prisma.file.findUnique({
        where: {
            id,
        },
    });
}

async function deleteFile({ id, gameId }) {
    return await prisma.file.delete({
        where: {
            id, block: { page: { gameId } }
        },
    });
}

async function getFilesByBlock({ blockId, gameId }) {
    return await prisma.file.findMany({
        where: { blockId, block: { page: { gameId } } },
    });
}

async function deleteFilesByBlock({blockId, gameId}) {
    return await prisma.file.deleteMany({
        where: { blockId, block: { page: { gameId } } },
    });
}

export default { createFile, deleteFile, getFile, deleteFilesByBlock, getFilesByBlock };
