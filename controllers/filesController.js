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

async function uploadFile(req, res) {
    console.log("Upload file request received");
    const reqBody = JSON.parse(req.body.block);
    console.log("Block data:");
    console.log(reqBody);
    const title = req.file.originalname;
    const url = req.file.location;
    const filename = req.file.key;
    const blockId = reqBody.id;
    const relevantData = { title, url, filename, blockId };
    console.log("Data for file creation:");
    console.log(relevantData);
    db.createFile(relevantData);

    res.send(relevantData);
}

async function deleteFile(req, res) {
    const { key } = req.body;
    console.log("Received files delete request");
    console.log(key);

    if (!key) {
        return res.status(400).json({ error: "Missing file key" });
    }

    result = await s3client.send(
        new DeleteObjectCommand({
            Bucket: "ldg-guides-images",
            Key: key,
        }),
    );

    res.send(result);
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
};
