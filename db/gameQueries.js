import { connect } from "http2";
import { prisma } from "../lib/prisma.js";

async function getGames() {
    return await prisma.game.findMany();
}

async function createGame(title) {
    return await prisma.game.create({
        data: {
            title,
        },
    });
}

async function getChecklists(gameId) {
    return await prisma.checklist.findMany({
        where: {
            gameId,
        },
    });
}

async function createChecklist(title, gameId) {
    return await prisma.checklist.create({
        data: {
            title,
            gameId,
        },
    });
}

async function getChecklistItems(checklistId) {
    return await prisma.checklistItem.findMany({
        where: {
            checklistId,
        },
        include: {
            tags: true,
        },
    });
}

async function createChecklistItem(title, checklistId) {
    return await prisma.checklistItem.create({
        data: {
            checklistId,
            title,
        },
    });
}

async function getChecklistItem(id) {
    return await prisma.checklistItem.findUnique({
        where: {
            id,
        },
        include: {
            tags: true,
        },
    });
}

async function updateChecklistItem({
    itemId,
    title,
    imageOne,
    imageTwo,
    tagId,
} = {}) {
    return await prisma.checklistItem.update({
        where: {
            id: itemId,
        },
        data: {
            title,
            imageOne,
            imageTwo,
            ...(tagId && {
                tags: {
                    connect: {
                        id: tagId,
                    },
                },
            }),
        },
    });
}

async function getTags() {
    return await prisma.tag.findMany();
}

async function createTag(title) {
    return await prisma.tag.create({
        data: { title },
    });
}

async function unlinkItemAndTag({ itemId, tagId }) {
    return await prisma.checklistItem.update({
        where: { id: itemId },
        data: {
            tags: {
                disconnect: [{ id: tagId }],
            },
        },
    });
}

export default {
    getGames,
    createGame,
    createChecklist,
    getChecklists,
    getChecklistItems,
    createChecklistItem,
    getChecklistItem,
    updateChecklistItem,
    getTags,
    createTag,
    unlinkItemAndTag,
};
