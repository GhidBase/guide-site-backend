import db from "../db/pagesQueries.js";

async function getPages(req, res) {
    console.log("pages request received");
    const result = await db.getPages();
    res.send(result);
}

async function postPage(req, res) {
    const title = req.body.title;

    console.log("Page POST request received");
    const exists = await db.checkPagesForTitle(title);
    if (exists) {
        console.log("Page already exists");
        res.status(400).send({ error: "Page already exists" });
        return;
    }
    const result = await db.createPage(title, 1);
    res.send(result);
}

async function deletePage(req, res) {
    const id = +req.params.pageId;
    const exists = await db.checkPageById(id);
    if (!exists) {
        console.log("Error: couldn't find page with id " + id);
        res.end();
        return;
    }

    const result = await db.deletePageById(id);
    console.log(result);
    res.send(result);
    return;
}

async function updatePage(req, res) {
    console.log("Received edit request");
    const id = +req.params.pageId;
    const title = req.body.title;
    const result = await db.updatePage({ id, title });
    console.log(result);
    res.send(result);
}

async function getPage(req, res) {
    console.log("Received page get request");
    const pageId = +req.params.pageId;
    const page = await db.getPage(pageId);
    const blocks = await db.getPageBlocks(pageId);
    console.log("page and blocks:");
    console.log(page, blocks);
    res.send({ page, blocks });
}

async function createBlockForPage(req, res) {
    console.log("Received block creation request");
    const pageId = +req.params.pageId;
    const result = await db.createBlockForPage(pageId);
    console.log(result);
    res.send(result);
}

export default {
    getPages,
    getPage,
    postPage,
    deletePage,
    updatePage,
    createBlockForPage,
};
