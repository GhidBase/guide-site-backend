import db from "../db/gameImageQueries.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3client = new S3Client({ region: "us-east-2" });

async function getGameImages(req, res) {
    const gameId = +req.params.gameId;
    const images = await db.getGameImages(gameId);
    res.json(images);
}

async function uploadGameImage(req, res) {
    const gameId = +req.params.gameId;
    const file = req.files[0];
    const category = req.body.category || null;
    const image = await db.createGameImage({
        title: file.originalname,
        filename: file.key,
        url: file.location,
        gameId,
        category,
    });
    res.status(201).json(image);
}

async function deleteGameImage(req, res) {
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

export default { getGameImages, uploadGameImage, deleteGameImage };
