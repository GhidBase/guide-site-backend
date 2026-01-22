import db from "../db/blocksQueries.js";

async function getBlock(req, res) {
    const blockId = +req.params.blockId;
    const gameId = +req.params.gameId;

    console.log("Block get request received " + blockId);
    const result = await db.getBlock({ id: blockId, gameId });
    res.send(result);
}

async function deleteBlock(req, res) {
    const id = +req.params.blockId;
    const gameId = +req.params.gameId;

    console.log("Block deletion request received on block ID:" + id);
    const result = await db.deleteBlock({ id, gameId });
    console.log("Deleted block:");
    console.log(result);
    res.send(result);
}

async function updateBlock(req, res) {
    const id = +req.params.blockId;
    const gameId = +req.params.gameId;

    console.log("Block update request received for Block ID: " + id);
    const { content, content2 } = req.body;
    const result = await db.updateBlock({ id, content, content2, gameId });
    console.log(result);
    res.send(result);
}

export default { deleteBlock, updateBlock, getBlock };
