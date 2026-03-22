import db from "../db/gameImageQueries.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3client = new S3Client({ region: "us-east-2" });

async function getImages(_req, res) {
    const images = await db.getGlobalImages();
    res.json(images);
}

async function uploadImage(req, res) {
    const file = req.files[0];
    const category = req.body.category || null;
    const image = await db.createGlobalImage({
        title: req.body.title || file.originalname,
        filename: file.key,
        url: file.location,
        category,
    });
    res.status(201).json(image);
}

async function deleteImage(req, res) {
    const id = +req.params.imageId;
    const image = await db.getGameImage(id);
    if (!image) {
        return res.status(404).json({ error: "Image not found" });
    }

    await s3client.send(
        new DeleteObjectCommand({
            Bucket: "ldg-guides-images",
            Key: image.filename,
        }),
    );

    await db.deleteGameImage(id);
    res.json({ message: "Image deleted" });
}

export default { getImages, uploadImage, deleteImage };
