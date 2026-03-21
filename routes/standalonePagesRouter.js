import { Router } from "express";
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import { requireAuth, requireEditor } from "../config/auth.js";
import blocksController from "../controllers/blocksController.js";
import pagesController from "../controllers/pagesController.js";
import pageImagesController from "../controllers/pageImagesController.js";

const s3client = new S3Client({ region: "us-east-2" });
const upload = multer({
    storage: multerS3({
        s3: s3client,
        bucket: "ldg-guides-images",
        metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
        key: (req, file, cb) => {
            const ext = file.originalname.slice(file.originalname.lastIndexOf("."));
            cb(null, Date.now().toString() + ext);
        },
    }),
});

const router = Router();

// POST   /pages/by-id/:pageId/blocks
router.post("/by-id/:pageId/blocks", requireAuth, pagesController.createBlockForPage);

// PUT    /pages/by-id/:pageId/blocks  (reorder)
router.put("/by-id/:pageId/blocks", requireAuth, pagesController.updateBlocksForPage);

// GET    /pages/by-id/:pageId/blocks/:blockId
router.get("/by-id/:pageId/blocks/:blockId", blocksController.getBlockStandalone);

// PUT    /pages/by-id/:pageId/blocks/:blockId
router.put("/by-id/:pageId/blocks/:blockId", requireAuth, blocksController.updateBlockStandalone);

// DELETE /pages/by-id/:blockId
router.delete("/by-id/:blockId", requireAuth, blocksController.deleteBlockStandalone);

// GET    /pages/by-id/:pageId/images
router.get("/by-id/:pageId/images", pageImagesController.getPageImages);

// POST   /pages/by-id/:pageId/images
router.post("/by-id/:pageId/images", requireEditor, upload.any(), pageImagesController.uploadPageImage);

// DELETE /pages/by-id/:pageId/images/:imageId
router.delete("/by-id/:pageId/images/:imageId", requireEditor, pageImagesController.deletePageImage);

export default router;
