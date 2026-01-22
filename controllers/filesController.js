import {
    S3Client,
    CreateBucketCommand,
    DeleteObjectCommand,
    paginateListObjectsV2,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import db from "../db/filesQueries.js";

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
    const file = req.files[0];
    const title = file.originalname;
    const url = file.location;
    const filename = file.key;
    const blockId = +req.params.blockId;
    const relevantData = { title, url, filename, blockId };
    db.createFile(relevantData);

    console.log("uploading file: " + filename + " to block: " + blockId);
    res.send(relevantData);
}

async function deleteBlockFiles(req, res) {
    console.log("Block files delete request: " + req.params.blockId);
    const blockId = +req.params.blockId;
    const gameId = +req.params.gameId;

    // Get list of files
    const result = await db.getFilesByBlock({ blockId, gameId });

    // List S3 names
    const s3Urls = result.map((current) => current.filename);

    // Delete them all from amazon s3

    console.log("Deleting S3 files");
    const deleteS3Result = await Promise.all(
        s3Urls.map((url) =>
            s3client.send(
                new DeleteObjectCommand({
                    Bucket: "ldg-guides-images",
                    Key: url,
                }),
            ),
        ),
    );

    console.log(deleteS3Result);

    // Afterwards, delete all the files
    const deletionResult = await db.deleteFilesByBlock({ blockId, gameId });

    console.log(deletionResult);
    res.send(deletionResult);
}

async function deleteFile(req, res) {
    const id = +req.params.id;
    const gameId = +req.params.gameId;

    console.log("ile delete request: " + id);

    const getFileResult = await db.getFile(id);

    console.log(getFileResult);

    const key = getFileResult.filename;
    if (!key) {
        return res.status(400).json({ error: "Missing file key" });
    }
    console.log(key);

    const deleteFileDBResult = await db.deleteFile({ id, gameId });

    console.log("Delete file from DB response:");
    console.log(deleteFileDBResult);

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

    console.log("End of deletion request");
    res.send(getFileResult);
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
