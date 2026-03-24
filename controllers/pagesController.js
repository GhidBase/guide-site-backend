import db from "../db/pagesQueries.js";
import pendingDb from "../db/pendingQueries.js";

async function getPages(req, res) {
    const gameId = +req.params.gameId;
    console.log("pages request received for gameId :" + gameId);
    const result = await db.getPages(gameId);
    res.send(result);
}

async function postPage(req, res) {
    const { title } = req.body;
    const gameId = +req.params.gameId;
    const sectionId = +req.body.sectionId ? +req.body.sectionId : null;

    console.log("Page POST request received");
    console.log(gameId);
    console.log({ title, gameId, sectionId });
    if (!title || !gameId) {
        console.log("error");
        return;
    }
    const exists = await db.checkPagesForTitle({ title, gameId });
    if (exists) {
        console.log("Page already exists");
        res.status(400).send({ error: "Page already exists" });
        return;
    }

    const result = await db.createPage({
        title,
        gameId,
        sectionId,
    });
    res.send(result);
}

async function deletePage(req, res) {
    const id = +req.params.pageId;
    const gameId = +req.params.gameId;

    const exists = await db.checkPageById(id, gameId);
    if (!exists) {
        console.log("Error: couldn't find page with id " + id);
        res.end();
        return;
    }

    const result = await db.deletePageById(id, gameId);
    console.log(result);
    res.send(result);
    return;
}

// this function is SOLELY for page title and slug update.
// page section change will be handled in a different functions in sectionsController.js and sectionsQueries.js
async function updatePage(req, res) {
    console.log("Received edit request");
    const id = +req.params.pageId;
    const gameId = +req.params.gameId;

    const { title, slug, description } = req.body;
    const sort = +req.body.sort;
    const sectionId = req.body.sectionId === null ? null : req.body.sectionId !== undefined ? +req.body.sectionId : undefined;
    const wide = req.body.wide !== undefined ? Boolean(req.body.wide) : undefined;
    const views = req.body.views !== undefined ? +req.body.views : undefined;
    console.log(sort);
    const result = await db.updatePage({ id, title, slug, gameId, sort, description, sectionId, wide, views });
    console.log(result);
    res.send(result);
}

async function getNonGamePage(req, res) {
    console.log("\nReceived non game page request");
    console.log(req.params);
    const slug = req.params.pageSlug;
    const page = await db.getPageBySlugWithNoGame({ slug });
    let blocks = [];
    if (!!page) {
        console.log("Page not null");
        console.log(page);
        blocks = await db.getPageBlocks(page.id);
    }

    let notFound = false;
    if (page == null) {
        notFound = true;
        console.log(`[404] Non-game page not found — slug: "${slug}"`);
    }
    res.send({ page, blocks, notFound });
}

async function getNonGamePages(req, res) {
    console.log("\n Received request for non game pages");
    console.log(req.params);
    const pages = await db.getPagesWithoutGame();
    console.log(pages);

    res.send(pages);
}

async function getPage(req, res) {
    console.log("Received page get request");
    console.log(req.params);
    const gameId = +req.params.gameId;
    const slug = req.params.slug;
    console.log("GameId: " + gameId);
    console.log("PageSlug: " + slug);

    let page, blocks;
    if (isNaN(gameId)) {
        page = await db.getPageBySlugWithNoGame({ slug });
    } else {
        page = await db.getPageBySlugAndGameId({ gameId, slug });
    }
    if (page != null) {
        console.log("Page not null");
        console.log(page);
        blocks = await db.getPageBlocks(page.id);
    }

    let notFound = false;
    if (page == null) {
        notFound = true;
    }
    res.send({ page, blocks, notFound });
}

async function createBlockForPage(req, res) {
    console.log("Received block creation request");
    const pageId = +req.params.pageId;
    const order = +req.body.order;
    const type = req.body.type;
    // blank type implies it's a text block
    //const result = await db.createBlockForPage({ pageId, order, type });
    //console.log(result);
    //res.send(result);
    //const content = req.body.content;

    if (req.user.role === "ADMIN" || req.user.role === "EDITOR") {
        const result = await db.createBlockForPage({ pageId, order, type });
        console.log(result);
        res.send(result);
    } else {
        await pendingDb.createPendingBlock({
            userId: req.user.id,
            operation: "CREATE",
            content: { order, type, pageId, content },
            type: "block-creation-request",
        });
        res.status(202).json({
            message: "Block creation requested, pending review.",
        });
    }
}

async function updateBlocksForPage(req, res) {
    const pageId = +req.params.pageId;
    const updateType = req.body.type;
    const order = +req.body.order;
    console.log("Received request to update blocks for page " + pageId);
    console.log(updateType);
    if (req.user.role === "ADMIN" || req.user.role === "EDITOR") {
        let result;
        if (updateType === "offset") {
            result = await offsetBlockOrderForPage(pageId, order);
        }
        res.send(result);
    } else {
        await pendingDb.createPendingBlock({
            userId: req.user.id,
            operation: "UPDATE",
            content: { updateType, order, pageId },
            type: "block-order-update-request",
        });
        res.status(202).json({
            message: "Block order update requested, pending review.",
        });
    }
}

async function offsetBlockOrderForPage(pageId, order) {
    const result = await db.offsetBlockOrderForPage(pageId, order);
    return result;
}

async function incrementViews(req, res) {
    const pageId = +req.params.pageId;
    if (isNaN(pageId)) return res.status(400).end();
    await db.incrementPageViews(pageId);
    res.status(204).end();
}

async function claimPage(req, res) {
    const pageId = +req.params.pageId;
    const userId = req.user?.id;
    if (isNaN(pageId) || !userId) return res.status(400).end();
    await db.claimPage({ pageId, userId });
    res.status(204).end();
}

async function unclaimPage(req, res) {
    const pageId = +req.params.pageId;
    if (isNaN(pageId)) return res.status(400).end();
    await db.unclaimPage(pageId);
    res.status(204).end();
}

async function getAnalytics(req, res) {
    const gameId = req.params.gameId ? +req.params.gameId : null;
    const data = await db.getAnalytics(gameId);
    res.json(data);
}

async function getViewLeaderboard(req, res) {
    const gameId = req.params.gameId ? +req.params.gameId : null;
    const since = req.query.since ?? null;
    const data = await db.getViewLeaderboard(gameId, since);
    res.json(data);
}

export async function reorderPages(req, res) {
    try {
        const { sectionId, pageOrder } = req.body;

        if (!Array.isArray(pageOrder) || pageOrder.length === 0) {
            return res.status(400).json({
                error: "pageOrder must be a non-empty array",
            });
        }

        await db.updatePageOrder(pageOrder, sectionId);

        res.json({ success: true });
    } catch (error) {
        console.error("Failed to reorder pages:", error);
        res.status(500).json({
            error: "Failed to reorder pages",
        });
    }
}

export default {
    getPages,
    getPage,
    postPage,
    deletePage,
    updatePage,
    createBlockForPage,
    updateBlocksForPage,
    getNonGamePage,
    getNonGamePages,
    incrementViews,
    claimPage,
    unclaimPage,
    getAnalytics,
    getViewLeaderboard,
};
