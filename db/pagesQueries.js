import { prisma } from "../lib/prisma.js";

async function getPages() {
    return await prisma.page.findMany();
}

async function createPage(title, gameId) {
    // Null slugs can be error prone, users can change it later
    const slug = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    return await prisma.page.create({
        data: { title, gameId, slug },
    });
}

async function checkPagesForTitle(title) {
    const result = await prisma.page.findFirst({
        where: {
            title,
        },
    });

    return result !== null;
}

async function checkPageById(id) {
    const result = await prisma.page.findUnique({
        where: { id },
    });

    return result !== null;
}

async function deletePageById(id) {
    return await prisma.page.delete({
        where: {
            id,
        },
    });
}

async function updatePage({ id, title, slug } = {}) {
    return await prisma.page.update({
        where: {
            id,
        },
        data: {
            title,
            slug,
        },
    });
}

async function getPage(id) {
    return await prisma.page.findUnique({
        where: {
            id,
        },
    });
}

async function getPageBlocks(pageId) {
    return await prisma.block.findMany({
        where: {
            pageId,
        },
        include: {
            files: true,
        },
    });
}

async function getPageBySlugAndGameId({ slug, gameId }) {
    return await prisma.page.findUnique({
        where: {
            slug_gameId: {
                slug,
                gameId,
            },
        },
    });
}

async function getPageBlocksBySlugAndGameId({ slug, gameId }) {
    return await prisma.block.findMany({
        where: {
            page: {
                slug,
                gameId,
            },
        },
        include: {
            files: true,
        },
    });
}

async function createBlockForPage({ pageId, order, type }) {
    return await prisma.block.create({
        data: {
            pageId,
            order,
            type,
        },
    });
}

async function offsetBlockOrderForPage(pageId, order) {
    // Specifically, offsets order starting from "order", inclusive
    return await prisma.block.updateMany({
        where: {
            pageId,
            order: {
                gte: order,
            },
        },
        data: {
            order: {
                increment: 1,
            },
        },
    });
}

export default {
    getPages,
    getPage,
    createPage,
    checkPagesForTitle,
    deletePageById,
    checkPageById,
    updatePage,
    getPageBlocks,
    createBlockForPage,
    offsetBlockOrderForPage,
    getPageBySlugAndGameId,
    getPageBlocksBySlugAndGameId,
};
