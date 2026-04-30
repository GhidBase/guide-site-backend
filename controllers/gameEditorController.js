import db from "../db/gameEditorQueries.js";
import chatDb from "../db/chatQueries.js";

async function getGameEditors(req, res) {
    const gameId = +req.params.gameId;
    const editors = await db.getGameEditors(gameId);
    res.json(editors.map(e => ({ id: e.user.id, username: e.user.username, assignedAt: e.assignedAt })));
}

async function addGameEditor(req, res) {
    const gameId = +req.params.gameId;
    const { userId } = req.body;
    const editor = await db.addGameEditor(gameId, +userId);

    await chatDb.createChatMessage({
        gameId,
        userId: req.user.id,
        username: req.user.username,
        text: `${editor.user.username} was granted editor access by ${req.user.username}`,
        type: "editor_granted",
    });

    res.status(201).json({ id: editor.user.id, username: editor.user.username, assignedAt: editor.assignedAt });
}

async function removeGameEditor(req, res) {
    const gameId = +req.params.gameId;
    const userId = +req.params.userId;

    const editor = await db.getGameEditorUser(gameId, userId);
    if (!editor) return res.sendStatus(404);

    await db.removeGameEditor(gameId, userId);

    await chatDb.createChatMessage({
        gameId,
        userId: req.user.id,
        username: req.user.username,
        text: `${editor.user.username}'s editor access was revoked`,
        type: "editor_revoked",
    });

    res.sendStatus(204);
}

export default { getGameEditors, addGameEditor, removeGameEditor };
