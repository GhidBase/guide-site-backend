import db from "../db/chatQueries.js";

async function getChatMessages(req, res) {
    const gameId = +req.params.gameId;
    const limit = Math.min(+(req.query.limit) || 100, 500);
    const messages = await db.getChatMessages(gameId, limit);
    res.json(messages);
}

async function postChatMessage(req, res) {
    const gameId = +req.params.gameId;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: "Text is required" });
    }
    if (text.length > 500) {
        return res.status(400).json({ message: "Message exceeds 500 characters" });
    }

    const message = await db.createChatMessage({
        gameId,
        userId: req.user.id,
        username: req.user.username,
        text: text.trim(),
    });

    res.status(201).json(message);
}

async function deleteChatMessage(req, res) {
    const messageId = +req.params.messageId;
    const message = await db.getChatMessage(messageId);

    if (!message) return res.sendStatus(404);
    if (message.userId !== req.user.id && req.user.role !== "ADMIN") {
        return res.sendStatus(403);
    }

    await db.deleteChatMessage(messageId);
    res.sendStatus(204);
}

export default { getChatMessages, postChatMessage, deleteChatMessage };
