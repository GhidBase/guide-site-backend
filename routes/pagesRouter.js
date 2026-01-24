import requireAdmin from "../config/requireAdmin.js";
import pagesController from "../controllers/pagesController.js";

import { Router } from "express";
const router = Router();

// route is "/pages"
router.get("/", pagesController.getPages);
router.post("/", requireAdmin, pagesController.postPage);
router.get("/:pageInfo", pagesController.getPage);
router.delete("/:pageId", requireAdmin, pagesController.deletePage);
router.put("/:pageId", requireAdmin, pagesController.updatePage);
router.post(
    "/:pageId/blocks",
    requireAdmin,
    pagesController.createBlockForPage,
);
router.put(
    "/:pageId/blocks",
    requireAdmin,
    pagesController.updateBlocksForPage,
);

export default router;
