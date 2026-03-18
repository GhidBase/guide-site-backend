import db from "../db/commentQueries.js";

async function getAllCommentsForGame(req, res) {
    const gameId = +req.params.gameId;
    const comments = await db.getAllCommentsForGame(gameId, req.user.id);
    res.json(comments);
}

async function getComments(req, res) {
    const pageIdParam = req.params.pageId;
    const pageId = await db.resolvePageId(pageIdParam);
    if (!pageId) {
        return res.status(404).json({ error: "Page not found" });
    }

    const currentUserId = req.user ? req.user.id : null;
    const comments = await db.getCommentsForPage(pageId, currentUserId);
    res.json(comments);
}

async function postComment(req, res) {
    const pageIdParam = req.params.pageId;
    const pageId = await db.resolvePageId(pageIdParam);
    if (!pageId) {
        return res.status(404).json({ error: "Page not found" });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.status(400).json({ error: "text is required" });
    }

    const comment = await db.createComment({
        pageId,
        userId: req.user.id,
        username: req.user.username,
        text: text.trim(),
    });
    res.status(201).json(comment);
}

async function postReply(req, res) {
    const commentId = +req.params.commentId;
    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.status(400).json({ error: "text is required" });
    }

    const reply = await db.createReply({
        parentId: commentId,
        userId: req.user.id,
        username: req.user.username,
        text: text.trim(),
    });

    if (!reply) {
        return res.status(404).json({ error: "Comment not found or cannot reply to a reply" });
    }
    res.status(201).json(reply);
}

async function updateComment(req, res) {
    const commentId = +req.params.commentId;
    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.status(400).json({ error: "text is required" });
    }

    const comment = await db.getCommentById(commentId);
    if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
    }
    if (comment.userId !== req.user.id && req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden" });
    }

    const updated = await db.updateComment(commentId, text.trim());
    res.json(updated);
}

async function deleteComment(req, res) {
    const commentId = +req.params.commentId;

    const comment = await db.getCommentById(commentId);
    if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
    }
    if (comment.userId !== req.user.id && req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden" });
    }

    await db.deleteComment(commentId);
    res.sendStatus(200);
}

async function upvoteComment(req, res) {
    const commentId = +req.params.commentId;

    const comment = await db.getCommentById(commentId);
    if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
    }

    const result = await db.toggleUpvote(commentId, req.user.id);
    res.json(result);
}

export default {
    getAllCommentsForGame,
    getComments,
    postComment,
    postReply,
    updateComment,
    deleteComment,
    upvoteComment,
};
