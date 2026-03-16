import { prisma } from "../lib/prisma.js";

async function getBoards(gameId) {
    return await prisma.board.findMany({ where: { gameId } });
}

async function createBoard({ gameId, name, rows, cols, bgImage, bgSize, bgX, bgY }) {
    return await prisma.board.create({
        data: { gameId, name, rows, cols, bgImage, bgSize, bgX, bgY },
    });
}

async function updateBoard({ id, name, rows, cols, bgImage, bgSize, bgX, bgY }) {
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
        },
    });
}

async function deleteBoard(id) {
    return await prisma.board.delete({ where: { id } });
}

export default { getBoards, createBoard, updateBoard, deleteBoard };
