import { prisma } from "../lib/prisma.js";

async function deleteBlock(id) {
    return await prisma.block.delete({
        where: {
            id,
        },
    });
}

async function updateBlock(id, content) {
    return await prisma.block.update({
        where: {
            id,
        },
        data: {
            content: {
                type: "richText",
                content,
            },
        },
    });
}

export default { deleteBlock, updateBlock };
