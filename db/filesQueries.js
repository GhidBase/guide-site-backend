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

export default { createFile };
