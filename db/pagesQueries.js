import { prisma, Prisma } from "../lib/prisma.js";

async function getPages(gameId) {
    return await prisma.page.findMany({
        where: { gameId },
        include: {
            claimedBy: { select: { id: true, username: true } },
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

async function updatePage({ id, title, slug, gameId, sort, description, sectionId, wide, views } = {}) {
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
            ...(sectionId !== undefined && { sectionId }),
            ...(wide !== undefined && { wide }),
            ...(views !== undefined && { views }),
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
        include: {
            contributors: { select: { id: true, username: true } },
            claimedBy: { select: { id: true, username: true } },
        },
    });
}

async function getViewLeaderboard(gameId, since) {
    // All-time: use the denormalized views counter on Page (includes pre-PageView history)
    if (!since) {
        if (gameId) {
            return await prisma.$queryRaw`
                SELECT u.id, u.username, SUM(p.views)::int AS views
                FROM "Page" p
                JOIN "User" u ON u.id = p."claimedById"
                WHERE p."claimedById" IS NOT NULL
                  AND p."gameId" = ${gameId}
                GROUP BY u.id, u.username
                ORDER BY views DESC
                LIMIT 20
            `;
        } else {
            return await prisma.$queryRaw`
                SELECT u.id, u.username, SUM(p.views)::int AS views
                FROM "Page" p
                JOIN "User" u ON u.id = p."claimedById"
                WHERE p."claimedById" IS NOT NULL
                GROUP BY u.id, u.username
                ORDER BY views DESC
                LIMIT 20
            `;
        }
    }

    // Time-filtered: use PageView records
    const sinceDate = new Date(since);
    if (gameId) {
        return await prisma.$queryRaw`
            SELECT u.id, u.username, COUNT(pv.id)::int AS views
            FROM "PageView" pv
            JOIN "User" u ON u.id = pv."claimedById"
            JOIN "Page" p ON p.id = pv."pageId"
            WHERE pv."claimedById" IS NOT NULL
              AND p."gameId" = ${gameId}
              AND pv."createdAt" >= ${sinceDate}
            GROUP BY u.id, u.username
            ORDER BY views DESC
            LIMIT 20
        `;
    } else {
        return await prisma.$queryRaw`
            SELECT u.id, u.username, COUNT(pv.id)::int AS views
            FROM "PageView" pv
            JOIN "User" u ON u.id = pv."claimedById"
            WHERE pv."claimedById" IS NOT NULL
              AND pv."createdAt" >= ${sinceDate}
            GROUP BY u.id, u.username
            ORDER BY views DESC
            LIMIT 20
        `;
    }
}

async function claimPage({ pageId, userId }) {
    return await prisma.page.update({
        where: { id: pageId },
        data: { claimedById: userId },
    });
}

async function unclaimPage(pageId) {
    return await prisma.page.update({
        where: { id: pageId },
        data: { claimedById: null },
    });
}

async function getAnalytics(gameId, since) {
if (!since) {
        // All-time: use denormalized counter
        const pages = await prisma.page.findMany({
            where: gameId ? { gameId } : { gameId: null },
            orderBy: { views: "desc" },
            select: {
                id: true,
                title: true,
                slug: true,
                views: true,
                claimedBy: { select: { id: true, username: true } },
            },
        });

        const userViewMap = {};
        for (const page of pages) {
            if (page.claimedBy) {
                const { id, username } = page.claimedBy;
                if (!userViewMap[id]) userViewMap[id] = { id, username, views: 0, pageCount: 0 };
                userViewMap[id].views += page.views;
                userViewMap[id].pageCount += 1;
            }
        }
        const users = Object.values(userViewMap).sort((a, b) => b.views - a.views);
        return { pages, users };
    }

    // Time-filtered: count PageView records
    const sinceDate = new Date(since);
    const rows = gameId
        ? await prisma.$queryRaw`
            SELECT p.id, p.title, p.slug, p."claimedById",
                   u.username AS "claimedUsername",
                   COUNT(pv.id)::int AS views
            FROM "Page" p
            LEFT JOIN "PageView" pv ON pv."pageId" = p.id AND pv."createdAt" >= ${sinceDate}
            LEFT JOIN "User" u ON u.id = p."claimedById"
            WHERE p."gameId" = ${gameId}
            GROUP BY p.id, p.title, p.slug, p."claimedById", u.username
            ORDER BY views DESC
          `
        : await prisma.$queryRaw`
            SELECT p.id, p.title, p.slug, p."claimedById",
                   u.username AS "claimedUsername",
                   COUNT(pv.id)::int AS views
            FROM "Page" p
            LEFT JOIN "PageView" pv ON pv."pageId" = p.id AND pv."createdAt" >= ${sinceDate}
            LEFT JOIN "User" u ON u.id = p."claimedById"
            WHERE p."gameId" IS NULL
            GROUP BY p.id, p.title, p.slug, p."claimedById", u.username
            ORDER BY views DESC
          `;

    const pages = rows.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        views: r.views,
        claimedBy: r.claimedById ? { id: r.claimedById, username: r.claimedUsername } : null,
    }));

    const userViewMap = {};
    for (const page of pages) {
        if (page.claimedBy) {
            const { id, username } = page.claimedBy;
            if (!userViewMap[id]) userViewMap[id] = { id, username, views: 0, pageCount: 0 };
            userViewMap[id].views += page.views;
            userViewMap[id].pageCount += 1;
        }
    }
    const users = Object.values(userViewMap).sort((a, b) => b.views - a.views);
    return { pages, users };
}

async function incrementPageViews(pageId) {
    const page = await prisma.page.findUnique({
        where: { id: pageId },
        select: { claimedById: true },
    });
    await prisma.$transaction([
        prisma.page.update({
            where: { id: pageId },
            data: { views: { increment: 1 } },
        }),
        prisma.pageView.create({
            data: {
                pageId,
                claimedById: page?.claimedById ?? null,
            },
        }),
    ]);
}

async function addContributor({ pageId, userId }) {
    return await prisma.page.update({
        where: { id: pageId },
        data: {
            contributors: {
                connect: { id: userId },
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
    addContributor,
    incrementPageViews,
    getViewLeaderboard,
    claimPage,
    unclaimPage,
    getAnalytics,
};
