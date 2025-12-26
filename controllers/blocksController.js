import db from "../db/blocksQueries.js";

async function deleteBlock(req, res) {
    const id = +req.params.blockId;
    console.log("Block deletion request received on block ID:" + id);
    const result = await db.deleteBlock(id);
    console.log("Deleted block:");
    console.log(result);
    res.send(result);
}

async function updateBlock(req, res) {
    const id = +req.params.blockId;
    console.log("Block update request received for Block ID: " + id);
    const { content, content2 } = req.body;
    const result = await db.updateBlock({ id, content, content2 });
    console.log(result);
    res.send(result);
}

export default { deleteBlock, updateBlock };
