import db from "../db/boardQueries.js";

async function getBoards(req, res) {
    const gameId = +req.params.gameId;
    const boards = await db.getBoards(gameId);
    res.json(boards);
}

async function createBoard(req, res) {
    const gameId = +req.params.gameId;
    const { name, rows, cols, bgImage, bgSize, bgX, bgY } = req.body;
    if (!name || !rows || !cols) {
        return res.status(400).json({ error: "name, rows, and cols are required" });
    }
    const board = await db.createBoard({ gameId, name, rows: +rows, cols: +cols, bgImage, bgSize, bgX: bgX !== undefined ? +bgX : undefined, bgY: bgY !== undefined ? +bgY : undefined });
    res.status(201).json(board);
}

async function updateBoard(req, res) {
    const id = +req.params.boardId;
    const { name, rows, cols, bgImage, bgSize, bgX, bgY } = req.body;
    const board = await db.updateBoard({
        id,
        name,
        rows: rows !== undefined ? +rows : undefined,
        cols: cols !== undefined ? +cols : undefined,
        bgImage,
        bgSize,
        bgX: bgX !== undefined ? +bgX : undefined,
        bgY: bgY !== undefined ? +bgY : undefined,
    });
    res.json(board);
}

async function deleteBoard(req, res) {
    const id = +req.params.boardId;
    await db.deleteBoard(id);
    res.json({ message: "Board deleted" });
}

export default { getBoards, createBoard, updateBoard, deleteBoard };
