import db from "../db/blocksQueries.js";
import pendingDb from "../db/pendingQueries.js";

async function getBlock(req, res) {
    const blockId = +req.params.blockId;
    console.log("Block get request received " + blockId);
    const result = await db.getBlock(blockId);
    res.send(result);
}

async function deleteBlock(req, res) {
    const id = +req.params.blockId;
    console.log("Block deletion request received on block ID:" + id);

    if (req.user.role === "ADMIN" || req.user.role === "EDITOR") {
        const result = await db.deleteBlock(id);
        console.log("Deleted block:");
        console.log(result);
        res.status(200).json(result);
    } else {
        await pendingDb.createPendingBlock({
            blockId: id,
            userId: req.user.id,
            operation: "DELETE",
            type: "block-deletion-request",
        });
        res.status(202).json({
            message: "Block deletion requested, pending review.",
        });
    }
}

async function updateBlock(req, res) {
    const id = +req.params.blockId;
    console.log("Block update request received for Block ID: " + id);
    const { content, content2, type } = req.body;

    if (req.user.role === "ADMIN" || req.user.role === "EDITOR") {
        const result = await db.updateBlock({ id, content, content2 });
        console.log(result);
        res.status(200).json(result);
    } else {
        await pendingDb.createPendingBlock({
            blockId: id,
            userId: req.user.id,
            operation: "UPDATE",
            content: { content, content2 },
            type: type || "block-update-request",
        });
        res.status(202).json({
            message: "Block update requested, pending review.",
        });
    }
}

export default { deleteBlock, updateBlock, getBlock };
