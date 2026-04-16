import {
    S3Client,
    CreateBucketCommand,
    DeleteObjectCommand,
    paginateListObjectsV2,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import db from "../db/filesQueries.js";
import pendingDb from "../db/pendingQueries.js";
import imageDb from "../db/gameImageQueries.js";

const s3client = new S3Client({ region: "us-east-2" });

async function checkCredentials(req, res) {
    res.send("hi");
}

async function createBucket(req, res) {
    const bucketName = "ldg-guides-images";
    const result = await s3client.send(
        new CreateBucketCommand({
            Bucket: bucketName,
        }),
    );
    res.send(result);
}

// path/blocks/:blockId/files

async function uploadFile(req, res) {
    console.log("Upload file request received");

    // Pool image reference — no actual upload, just link the URL to the block
    if (req.body?.imageUrl) {
        const url = req.body.imageUrl;
        const filename = url.split("/").pop();
        const blockId = +req.params.blockId;

        if (req.user.role === "ADMIN" || req.user.role === "EDITOR") {
            const newFile = await db.createFile({
                title: filename,
                filename,
                url,
                blockId,
                status: "ACTIVE",
            });
            return res.json(newFile);
        } else {
            const newFile = await db.createFile({
                title: filename,
                filename,
                url,
                blockId: null,
                status: "PENDING_UPLOAD",
            });
            await pendingDb.createPendingBlock({
                blockId,
                userId: req.user.id,
                operation: "ADD_FILE",
                content: { title: filename, url, filename, fileId: newFile.id },
                type: "file-upload-request",
            });
            return res.status(202).json({
                message: "File uploaded, pending review.",
                file: newFile,
            });
        }
    }

    const file = req.files[0];
    const title = file.originalname;
    const url = file.location;
    const filename = file.key;
    const blockId = +req.params.blockId;

    // Admin and Editors can directly upload files
    if (req.user.role === "ADMIN" || req.user.role === "EDITOR") {
        const newFile = await db.createFile({
            title,
            url,
            filename,
            blockId,
            status: "ACTIVE",
        });
        console.log("uploading file: " + filename + " to block: " + blockId);
        res.json(newFile);
    } else {
        // Users have to go through a review system
        const newFile = await db.createFile({
            title,
            url,
            filename,
            blockId: null,
            status: "PENDING_UPLOAD",
        });
        await pendingDb.createPendingBlock({
            blockId,
            userId: req.user.id,
            operation: "ADD_FILE",
            content: { title, url, filename, fileId: newFile.id },
            type: "file-upload-request",
        });
        res.status(202).json({
            message: "File uploaded, pending review.",
            file: newFile,
        });
    }
}

async function deleteBlockFiles(req, res) {
    console.log("Block files delete request: " + req.params.blockId);
    const blockId = +req.params.blockId;
    const gameId = +req.params.gameId;

    if (req.user.role === "ADMIN" || req.user.role === "EDITOR") {
        // Get list of files
        const result = await db.getFilesByBlock({ blockId, gameId });

        // Only delete S3 objects that are NOT pool image references
        const allFilenames = result.map((f) => f.filename);
        const poolFilenames = await imageDb.getPoolFilenameSet(allFilenames);
        const s3Filenames = allFilenames.filter((fn) => !poolFilenames.has(fn));

        console.log("Deleting S3 files");
        const deleteS3Result = await Promise.all(
            s3Filenames.map((filename) =>
                s3client.send(
                    new DeleteObjectCommand({
                        Bucket: "ldg-guides-images",
                        Key: filename,
                    }),
                ),
            ),
        );

        console.log(deleteS3Result);

        // Afterwards, delete all the file records
        const deletionResult = await db.deleteFilesByBlock({ blockId, gameId });

        console.log(deletionResult);
        return res.json(deletionResult);
    } else {
        const files = await db.getFilesByBlock({ blockId, gameId });
        await Promise.all(
            files.map((file) =>
                pendingDb.createPendingBlock({
                    blockId: blockId,
                    userId: req.user.id,
                    operation: "DELETE_FILE",
                    content: {
                        filename: file.filename,
                        url: file.url,
                        fileId: file.id,
                    },
                    type: "file-deletion-request",
                }),
            ),
        );

        await Promise.all(
            files.map((file) =>
                db.updateFileStatus(file.id, "PENDING_DELETION"),
            ),
        );

        res.status(202).json({
            message: "File deletions requested, pending review.",
            fileCount: files.length,
        });
    }
}

async function deleteFile(req, res) {
    const id = +req.params.id;
    const gameId = +req.params.gameId;

    console.log("File delete request: " + id);

    const fileToDelete = await db.getFile(id);
    if (!fileToDelete) {
        return res.status(404).json({ error: "File not found" });
    }

    if (req.user.role === "ADMIN" || req.user.role === "EDITOR") {
        const key = fileToDelete.filename;
        if (!key) {
            return res.status(400).json({ error: "Missing file key" });
        }
        console.log(key);

        const deleteFileDBResult = await db.deleteFile({ id, gameId });

        console.log("Delete file from DB response:");
        console.log(deleteFileDBResult);

        // Only delete from S3 if this file is not a pool image reference
        const poolFilenames = await imageDb.getPoolFilenameSet([key]);
        if (!poolFilenames.has(key)) {
            const deleteFileS3Result = await s3client.send(
                new DeleteObjectCommand({
                    Bucket: "ldg-guides-images",
                    Key: key,
                }),
            );
            console.log(
                "Delete file from S3 response (success message doesn't indicate deletion)",
            );
            console.log(deleteFileS3Result);
        } else {
            console.log("Skipping S3 deletion — file is a pool image reference");
        }

        console.log("End of deletion request");
        res.status(200).json({
            message: "File deleted successfully",
            file: fileToDelete,
        });
    } else {
        if (fileToDelete.status === "PENDING_DELETION") {
            return res.status(409).json({
                message: "File already has a pending deletion request.",
            });
        }

        await pendingDb.createPendingBlock({
            blockId: fileToDelete.blockId,
            userId: req.user.id,
            operation: "DELETE_FILE",
            content: {
                filename: fileToDelete.filename,
                url: fileToDelete.url,
                fileId: fileToDelete.id,
            },
            type: "file-deletion-request",
        });

        await db.updateFileStatus(id, "PENDING_DELETION");
        res.status(202).json({
            message: "File deletion requested, pending review.",
            file: fileToDelete,
        });
    }
}

// Replacing this with a script that just fetches file data from
// prisma. I don't believe I need a dedicated download function
async function downloadFile(req, res) {
    const { key } = req.body;
    console.log("Received file get request");
    console.log(key);

    const response = await s3client.send(
        new GetObjectCommand({
            Bucket: "ldg-guides-images",
            Key: key,
        }),
    );

    res.setHeader("Content-Type", response.ContentType);
    response.Body.pipe(res);
}

export default {
    createBucket,
    uploadFile,
    checkCredentials,
    deleteFile,
    downloadFile,
    deleteBlockFiles,
};
