import pagesController from "../controllers/pagesController.js";

import { Router } from "express";
const router = Router();

router.get("/", pagesController.index);
router.post("/", pagesController.postPage)

export default router;
