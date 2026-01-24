import blocksController from "../controllers/blocksController.js";
import { Router } from "express";
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import filesController from "../controllers/filesController.js";
import requireAdmin from "../config/requireAdmin.js";

const s3client = new S3Client({ region: "us-east-2" });
const router = Router();

const upload = multer({
    storage: multerS3({
        s3: s3client,
        bucket: "ldg-guides-images",
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString());
        },
    }),
});

// route is "blocks"
router.get("/:blockId", blocksController.getBlock);
router.delete("/:blockId", requireAdmin, blocksController.deleteBlock);
router.delete(
    "/:blockId/files",
    requireAdmin,
    filesController.deleteBlockFiles,
);
router.put("/:blockId", requireAdmin, blocksController.updateBlock);
router.post(
    "/:blockId/files",
    requireAdmin,
    upload.any(),
    filesController.uploadFile,
);

export default router;
