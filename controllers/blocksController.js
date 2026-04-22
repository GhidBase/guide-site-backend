import db from "../db/blocksQueries.js";
import pendingDb from "../db/pendingQueries.js";
import pagesDb from "../db/pagesQueries.js";
import contributionDb from "../db/contributionQueries.js";

async function getBlock(req, res) {
    const blockId = +req.params.blockId;
    const gameId = req.params.gameId != null ? +req.params.gameId : null;

    console.log("Block get request received " + blockId);
    const result = await db.getBlock({ id: blockId, gameId });
    res.send(result);
}

async function deleteBlock(req, res) {
    const id = +req.params.blockId;
    const gameId = req.params.gameId != null ? +req.params.gameId : null;
    const exists = await db.getBlock({ id, gameId });
    if (!exists) {
        return res.status(404).json({ error: "Block not found" });
    }

    console.log("Block deletion request received on block ID:" + id);

    if (req.user.role === "ADMIN" || req.user.role === "EDITOR") {
        const result = await db.deleteBlock({ id, gameId });
        console.log("Deleted block:");
        console.log(result);
        res.status(200).json(result);
    } else {
        const existingPending =
            await pendingDb.findPendingBlockByBlockIdAndOperation(id, "DELETE");
        if (existingPending) {
            return res.status(409).json({
                error: "A pending deletion request for this block already exists.",
            });
        }

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
    const gameId = req.params.gameId != null ? +req.params.gameId : null;
    console.log("Block update request received for Block ID: " + id);
    const { content, content2, type } = req.body;

    if (req.user.role === "ADMIN" || req.user.role === "EDITOR") {
        const result = await db.updateBlock({ id, content, content2, gameId });
        console.log(result);
        await pagesDb.addContributor({ pageId: result.pageId, userId: req.user.id });
        if (gameId) {
            await contributionDb.createContribution({
                userId: req.user.id,
                pageId: result.pageId,
                gameId,
            });
        }
        res.status(200).json(result);
    } else {
        const existingPending =
            await pendingDb.findPendingBlockByBlockIdAndOperation(id, "UPDATE");
        if (existingPending) {
            await pendingDb.updatePendingBlock(existingPending.id, {
                content: { content, content2 },
                userId: req.user.id,
            });
        } else {
            await pendingDb.createPendingBlock({
                blockId: id,
                userId: req.user.id,
                operation: "UPDATE",
                content: { content, content2 },
                type: type || "block-update-request",
            });
        }
        res.status(202).json({
            message: "Block update requested, pending review.",
        });
    }
}

export default { deleteBlock, updateBlock, getBlock };
