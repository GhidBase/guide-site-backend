import db from "../db/dmQueries.js";

const RATE_LIMIT_MS = 60 * 1000;

async function getThreads(req, res) {
    if (req.user.role === "ADMIN") {
        const threads = await db.getAllThreads();
        return res.json(threads);
    }
    const messages = await db.getThreadMessages(req.user.id);
    res.json(messages);
}

async function getThread(req, res) {
    const threadUserId = +req.params.userId;
    const messages = await db.getThreadMessages(threadUserId);
    res.json(messages);
}

async function userSendMessage(req, res) {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: "Text is required" });
    }

    // Rate limit: 1 message per minute
    const last = await db.getLastUserMessage(req.user.id);
    if (last) {
        const secondsLeft = Math.ceil((RATE_LIMIT_MS - (Date.now() - new Date(last.createdAt).getTime())) / 1000);
        if (secondsLeft > 0) {
            return res.status(429).json({ retryAfter: secondsLeft });
        }
    }

    const message = await db.createMessage({
        threadUserId: req.user.id,
        senderId: req.user.id,
        senderUsername: req.user.username,
        isFromAdmin: false,
        text: text.trim(),
    });
    res.status(201).json(message);
}

async function adminReply(req, res) {
    const threadUserId = +req.params.userId;
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: "Text is required" });
    }

    const message = await db.createMessage({
        threadUserId,
        senderId: req.user.id,
        senderUsername: req.user.username,
        isFromAdmin: true,
        text: text.trim(),
    });
    res.status(201).json(message);
}

async function deleteMessage(req, res) {
    const id = +req.params.messageId;
    const message = await db.getMessage(id);
    if (!message) return res.sendStatus(404);
    await db.deleteMessage(id);
    res.sendStatus(204);
}

export default { getThreads, getThread, userSendMessage, adminReply, deleteMessage };
