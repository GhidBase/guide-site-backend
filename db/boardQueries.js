import { prisma } from "../lib/prisma.js";

async function getBoards(gameId) {
    return await prisma.board.findMany({ where: { gameId } });
}

async function createBoard({ gameId, name, rows, cols, bgImage, bgSize, bgX, bgY, heightScale, widthScale, bgPaddingX, bgPaddingY, gridOffsetX, gridOffsetY }) {
    return await prisma.board.create({
        data: { gameId, name, rows, cols, bgImage, bgSize, bgX, bgY, heightScale, widthScale, bgPaddingX, bgPaddingY, gridOffsetX, gridOffsetY },
    });
}

async function updateBoard({ id, name, rows, cols, bgImage, bgSize, bgX, bgY, heightScale, widthScale, bgPaddingX, bgPaddingY, gridOffsetX, gridOffsetY }) {
    return await prisma.board.update({
        where: { id },
        data: {
            ...(name !== undefined && { name }),
            ...(rows !== undefined && { rows }),
            ...(cols !== undefined && { cols }),
            ...(bgImage !== undefined && { bgImage }),
            ...(bgSize !== undefined && { bgSize }),
            ...(bgX !== undefined && { bgX }),
            ...(bgY !== undefined && { bgY }),
            ...(heightScale !== undefined && { heightScale }),
            ...(widthScale !== undefined && { widthScale }),
            ...(bgPaddingX !== undefined && { bgPaddingX }),
            ...(bgPaddingY !== undefined && { bgPaddingY }),
            ...(gridOffsetX !== undefined && { gridOffsetX }),
            ...(gridOffsetY !== undefined && { gridOffsetY }),
        },
    });
}

async function deleteBoard(id) {
    return await prisma.board.delete({ where: { id } });
}

export default { getBoards, createBoard, updateBoard, deleteBoard };
