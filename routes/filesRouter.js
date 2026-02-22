import { Router } from "express";
import {
    // S3Client,
    // PutObjectCommand,
    // CreateBucketCommand,
    // DeleteObjectCommand,
    // DeleteBucketCommand,
    // paginateListObjectsV2,
    // GetObjectCommand,
} from "@aws-sdk/client-s3";
import filesController from "../controllers/filesController.js";
import { requireAuth } from "../config/auth.js";

// not really used...
// const s3client = new S3Client({ region: "us-east-2" });
const router = Router({ mergeParams: true });

// route is files
router.delete("/:id", requireAuth, filesController.deleteFile);

export default router;
