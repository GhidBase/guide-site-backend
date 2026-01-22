import { prisma } from "../lib/prisma.js";

async function getBlock({ id, gameId }) {
    return await prisma.block.findUnique({
        where: {
            id, page: {
                gameId
            }
        },
        include: {
            files: true,
        },
    });
}

async function deleteBlock({ id, gameId }) {
    return await prisma.block.delete({
        where: {
            id, page: { gameId }
        },
    });
}

async function updateBlock({ id, content, content2, gameId }) {
    return await prisma.block.update({
        where: {
            id, page: { gameId }
        },
        data: {
            content: {
                type: "richText",
                content,
                content2,
            },
        },
    });
}

export default { deleteBlock, updateBlock, getBlock };
