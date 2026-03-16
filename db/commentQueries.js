import { prisma } from "../lib/prisma.js";

// Resolve pageId param (numeric string or slug) to a numeric Page.id
async function resolvePageId(pageIdParam) {
    const asInt = parseInt(pageIdParam, 10);
    if (!isNaN(asInt) && String(asInt) === pageIdParam) {
        return asInt;
    }
    // It's a slug — find the first page with this slug
    const page = await prisma.page.findFirst({
        where: { slug: pageIdParam },
        select: { id: true },
    });
    return page ? page.id : null;
}

function formatComment(comment, currentUserId) {
    const { upvotes, replies, ...rest } = comment;
    return {
        ...rest,
        upvoteCount: upvotes ? upvotes.length : 0,
        hasUpvoted: currentUserId
            ? upvotes.some((u) => u.userId === currentUserId)
            : false,
        replies: replies
            ? replies.map((r) => formatComment(r, currentUserId))
            : undefined,
    };
}

async function getCommentsForPage(pageId, currentUserId) {
    const comments = await prisma.comment.findMany({
        where: { pageId, parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
            upvotes: { select: { userId: true } },
            replies: {
                orderBy: { createdAt: "asc" },
                include: {
                    upvotes: { select: { userId: true } },
                },
            },
        },
    });
    return comments.map((c) => formatComment(c, currentUserId));
}

async function createComment({ pageId, userId, username, text }) {
    const comment = await prisma.comment.create({
        data: { pageId, userId, username, text },
        include: { upvotes: { select: { userId: true } } },
    });
    return formatComment({ ...comment, replies: [] }, userId);
}

async function createReply({ parentId, userId, username, text }) {
    const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { pageId: true, parentId: true },
    });
    if (!parent) return null;
    // Disallow nesting replies under replies
    if (parent.parentId !== null) return null;

    const reply = await prisma.comment.create({
        data: { pageId: parent.pageId, userId, username, text, parentId },
        include: { upvotes: { select: { userId: true } } },
    });
    return formatComment(reply, userId);
}

async function getCommentById(id) {
    return await prisma.comment.findUnique({ where: { id } });
}

async function updateComment(id, text) {
    const comment = await prisma.comment.update({
        where: { id },
        data: { text },
        include: {
            upvotes: { select: { userId: true } },
            replies: {
                orderBy: { createdAt: "asc" },
                include: { upvotes: { select: { userId: true } } },
            },
        },
    });
    return formatComment(comment, comment.userId);
}

async function deleteComment(id) {
    return await prisma.comment.delete({ where: { id } });
}

async function toggleUpvote(commentId, userId) {
    const existing = await prisma.commentUpvote.findUnique({
        where: { commentId_userId: { commentId, userId } },
    });

    if (existing) {
        await prisma.commentUpvote.delete({
            where: { commentId_userId: { commentId, userId } },
        });
    } else {
        await prisma.commentUpvote.create({ data: { commentId, userId } });
    }

    const upvoteCount = await prisma.commentUpvote.count({ where: { commentId } });
    return { upvoteCount, hasUpvoted: !existing };
}

export default {
    resolvePageId,
    getCommentsForPage,
    createComment,
    createReply,
    getCommentById,
    updateComment,
    deleteComment,
    toggleUpvote,
};
