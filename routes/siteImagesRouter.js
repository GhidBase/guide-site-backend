import { Router } from "express";
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import siteImagesController from "../controllers/siteImagesController.js";
import { requireEditor } from "../config/auth.js";

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
            const ext = file.originalname.slice(file.originalname.lastIndexOf("."));
            cb(null, Date.now().toString() + ext);
        },
    }),
});

// route is /images
router.get("/", siteImagesController.getImages);
router.post("/", requireEditor, upload.any(), siteImagesController.uploadImage);
router.delete("/:imageId", requireEditor, siteImagesController.deleteImage);

export default router;
