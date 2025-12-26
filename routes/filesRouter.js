import { Router } from "express";
import {
    S3Client,
    PutObjectCommand,
    CreateBucketCommand,
    DeleteObjectCommand,
    DeleteBucketCommand,
    paginateListObjectsV2,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import filesController from "../controllers/filesController.js";

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

// router.get("/", filesController.createBucket);
router.post("/", upload.single("upload-file"), filesController.uploadFile);
router.delete("/:fileId", filesController.deleteFile);

export default router;
