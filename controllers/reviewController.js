import pendingDb from "../db/pendingQueries.js";
import filesDb from "../db/filesQueries.js";
import blocksDb from "../db/blocksQueries.js";
import pagesDb from "../db/pagesQueries.js";
import contributionDb from "../db/contributionQueries.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3client = new S3Client({ region: "us-east-2" });

async function getAllPendingReviews(req, res) {
    try {
        const pendingReviews = await pendingDb.getPendingBlocks("PENDING");
        res.json(pendingReviews);
    } catch (err) {
        console.error("Error fetching pending reviews:", err);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
}

async function acceptReview(req, res) {
    const reviewId = +req.params.id;
    const { message } = req.body;

    try {
        const pending = await pendingDb.getPendingBlock(reviewId);

        if (!pending) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (pending.status !== "PENDING") {
            return res.status(400).json({ error: "Review already processed" });
        }

        switch (pending.operation) {
            case "ADD_FILE":
                const fileId = pending.content?.fileId;
                await filesDb.updateFile(fileId, {
                    status: "ACTIVE",
                    blockId: pending.blockId,
                });
                break;

            case "UPDATE":
                if (pending.blockId) {
                    await blocksDb.updateBlock({
                        id: pending.blockId,
                        content: pending.content?.content,
                        content2: pending.content?.content2,
                    });
                } else if (
                    pending.content?.pageId &&
                    pending.content?.updateType === "offset"
                ) {
                    await pagesDb.offsetBlockOrderForPage(
                        pending.content.pageId,
                        pending.content.order,
                    );
                }
                break;

            case "DELETE_FILE":
                const deleteFileId = pending.content?.fileId;
                const file = await filesDb.getFile(deleteFileId);

                try {
                    await s3client.send(
                        new DeleteObjectCommand({
                            Bucket: "ldg-guides-images",
                            Key: file.filename,
                        }),
                    );
                } catch (s3Error) {
                    console.error("S3 deletion failed:", s3Error);
                }

                await filesDb.deleteFile(deleteFileId);
                break;

            case "DELETE":
                await blocksDb.deleteBlock(pending.blockId);
                break;

            case "CREATE":
                if (pending.content?.pageId && pending.content?.order) {
                    await pagesDb.createBlockForPage({
                        pageId: pending.content.pageId,
                        order: pending.content.order,
                        type: pending.content.type,
                    });
                }
                break;

            default:
                return res
                    .status(400)
                    .json({ error: "Unknown operation type" });
        }

        await pendingDb.updatePendingBlock(reviewId, {
            status: "ACCEPTED",
            reviewerId: req.user.id,
            reviewedAt: new Date(),
            reviewMessage: message || null,
        });

        // Record contributor credit
        const pageId =
            pending.operation === "CREATE"
                ? pending.content?.pageId
                : pending.block?.pageId;
        if (pageId) {
            const page = await pagesDb.getPage(pageId);
            await pagesDb.addContributor({ pageId, userId: pending.userId });
            if (page?.gameId) {
                await contributionDb.createContribution({
                    userId: pending.userId,
                    pageId,
                    gameId: page.gameId,
                });
            }
        }

        res.json({
            message: "Review accepted successfully",
            reviewId,
        });
    } catch (error) {
        console.error("Error accepting review:", error);
        res.status(500).json({ error: "Failed to accept review" });
    }
}

async function refuseReview(req, res) {
    const reviewId = +req.params.id;
    const { message } = req.body;

    try {
        const pending = await pendingDb.getPendingBlock(reviewId);

        if (!pending) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (pending.status !== "PENDING") {
            return res.status(400).json({ error: "Review already processed" });
        }

        // If it's a file upload, delete the pending file from S3 and DB
        if (pending.operation === "ADD_FILE") {
            const fileId = pending.content?.fileId;
            const file = await filesDb.getFile(fileId);

            try {
                await s3client.send(
                    new DeleteObjectCommand({
                        Bucket: "ldg-guides-images",
                        Key: file.filename,
                    }),
                );
            } catch (s3Error) {
                console.error("S3 deletion failed:", s3Error);
            }

            await filesDb.deleteFile(fileId);
        }

        // If it's a file deletion request, revert status
        if (pending.operation === "DELETE_FILE") {
            const fileId = pending.content?.fileId;
            await filesDb.updateFileStatus(fileId, "ACTIVE");
        }

        await pendingDb.updatePendingBlock(reviewId, {
            status: "REFUSED",
            reviewerId: req.user.id,
            reviewedAt: new Date(),
            reviewMessage: message || "Request refused",
        });

        res.json({
            message: "Review refused successfully",
            reviewId,
        });
    } catch (error) {
        console.error("Error refusing review:", error);
        res.status(500).json({ error: "Failed to refuse review" });
    }
}

export default {
    getAllPendingReviews,
    acceptReview,
    refuseReview,
};
