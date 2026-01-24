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
};
