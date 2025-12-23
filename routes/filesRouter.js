import { Router } from "express";
const router = Router();
import multer from "multer";
import filesController from "../controllers/filesController.js";

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("upload-file"), filesController.test);

export default router;
