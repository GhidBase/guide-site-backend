import { Router } from "express";
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import usersController from "../controllers/usersController.js";
import { requireAuth } from "../config/auth.js";

const s3client = new S3Client({ region: "us-east-2" });

const upload = multer({
    storage: multerS3({
        s3: s3client,
        bucket: "ldg-guides-images",
        metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
        key: (req, file, cb) => {
            const ext = file.originalname.slice(file.originalname.lastIndexOf("."));
            cb(null, `avatars/${req.user.id}_${Date.now()}${ext}`);
        },
    }),
});

const router = Router();

// route is /users
router.get("/me", requireAuth, usersController.getMe);
router.patch("/me", requireAuth, usersController.updateMe);
router.post("/me/avatar", requireAuth, upload.single("avatar"), usersController.uploadAvatar);

export default router;
