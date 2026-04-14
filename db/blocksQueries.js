import { prisma } from "../lib/prisma.js";

async function getBlock({ id, gameId }) {
    return await prisma.block.findFirst({
        where: {
            id,
            ...(gameId != null ? { page: { gameId } } : {}),
        },
        include: {
            files: true,
        },
    });
}

async function deleteBlock({ id, gameId }) {
    return await prisma.block.delete({
        where: { id },
    });
}

async function updateBlock({ id, content, content2, gameId }) {
    const contentData =
        content !== null && typeof content === "object"
            ? content
            : { type: "richText", content, content2 };

    return await prisma.block.update({
        where: { id },
        data: { content: contentData },
        select: { id: true, pageId: true },
    });
}

export default { deleteBlock, updateBlock, getBlock };
