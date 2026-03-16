import { prisma } from "../lib/prisma.js";

async function getBoards(gameId) {
    return await prisma.board.findMany({ where: { gameId } });
}

async function createBoard({ gameId, name, rows, cols, bgImage }) {
    return await prisma.board.create({
        data: { gameId, name, rows, cols, bgImage },
    });
}

async function updateBoard({ id, name, rows, cols, bgImage }) {
    return await prisma.board.update({
        where: { id },
        data: {
            ...(name !== undefined && { name }),
            ...(rows !== undefined && { rows }),
            ...(cols !== undefined && { cols }),
            ...(bgImage !== undefined && { bgImage }),
        },
    });
}

async function deleteBoard(id) {
    return await prisma.board.delete({ where: { id } });
}

export default { getBoards, createBoard, updateBoard, deleteBoard };
