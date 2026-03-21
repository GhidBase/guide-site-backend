import db from "../db/pageImageQueries.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3client = new S3Client({ region: "us-east-2" });

async function getPageImages(req, res) {
    const pageId = +req.params.pageId;
    const images = await db.getPageImages(pageId);
    res.json(images);
}

async function uploadPageImage(req, res) {
    const pageId = +req.params.pageId;
    const file = req.files[0];
    const category = req.body.category || null;
    const image = await db.createPageImage({
        title: file.originalname,
        filename: file.key,
        url: file.location,
        pageId,
        category,
    });
    res.status(201).json(image);
}

async function deletePageImage(req, res) {
    const id = +req.params.imageId;
    const image = await db.getPageImage(id);
    if (!image) return res.status(404).json({ error: "Image not found" });

    await s3client.send(new DeleteObjectCommand({
        Bucket: "ldg-guides-images",
        Key: image.filename,
    }));

    await db.deletePageImage(id);
    res.json({ message: "Image deleted" });
}

export default { getPageImages, uploadPageImage, deletePageImage };
