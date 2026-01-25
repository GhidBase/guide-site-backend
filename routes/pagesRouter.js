import pagesController from "../controllers/pagesController.js";
import { requireAdmin, requireAuth } from "../config/auth.js";

import { Router } from "express";
const router = Router();

router.get("/", pagesController.getPages);
router.post("/", requireAdmin, pagesController.postPage);
router.get("/:pageInfo", pagesController.getPage);
router.delete("/:pageId", requireAdmin, pagesController.deletePage);
router.put("/:pageId", requireAdmin, pagesController.updatePage);
router.post("/:pageId/blocks", requireAuth, pagesController.createBlockForPage);
router.put("/:pageId/blocks", requireAuth, pagesController.updateBlocksForPage);

export default router;
