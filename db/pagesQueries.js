import { prisma } from "../lib/prisma.js";

async function getPages(gameId) {
    return await prisma.page.findMany({
        where: {
            gameId,
        },
    });
}

async function createPage({ title, gameId, sectionId }) {
    // Null slugs can cause errors, so we replace them with a default value
    // that can be changed later
    const slug = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    return await prisma.page.create({
        data: {
            title,
            gameId,
            sectionId,
            slug,
        },
    });
}

async function checkPagesForTitle({ title, gameId }) {
    const result = await prisma.page.findFirst({
        where: {
            title,
            gameId,
        },
    });

    return result !== null;
}

async function checkPageById(id, gameId) {
    const result = await prisma.page.findUnique({
        where: { id, gameId },
    });

    return result !== null;
}

async function deletePageById(id, gameId) {
    console.log(id, gameId);
    return await prisma.page.delete({
        where: {
            id,
            gameId,
        },
    });
}

async function updatePage({ id, title, slug, gameId, sort, description } = {}) {
    return await prisma.page.update({
        where: {
            id,
            gameId,
        },
        data: {
            title,
            slug,
            sort,
            description,
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
    if (pageId == undefined || pageId == null) {
        return null;
    }
    return await prisma.block.findMany({
        where: {
            pageId,
        },
        include: {
            files: true,
        },
    });
}

async function getPageBySlugWithNoGame({ slug }) {
    return await prisma.page.findFirst({
        where: { slug, gameId: undefined },
    });
}

async function getPagesWithoutGame() {
    return await prisma.page.findMany({
        where: { gameId: null },
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

async function updatePageOrder(pageOrder, sectionId) {
    await prisma.$transaction(
        pageOrder.map((pageId, index) =>
            prisma.page.update({
                where: {
                    id: pageId,
                    sectionId: sectionId,
                },
                data: { sort: index },
            })
        )
    );
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
    getPageBySlugWithNoGame,
    getPagesWithoutGame,
    updatePageOrder,
};
