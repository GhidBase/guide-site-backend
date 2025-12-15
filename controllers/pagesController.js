import db from "../db/pagesQueries.js";

async function getPages(req, res) {
    console.log("pages request received");
    const result = await db.getPages();
    res.send(result);
}

async function postPage(req, res) {
    console.log("create page request received");
    console.log(req.body.title);
    const title = req.body.title;
    const result = await db.createPage(title);
    res.send("pages create");
}

export default {
    getPages,
    postPage,
};
