import requireAdmin from "../config/requireAdmin.js";
import pagesController, { reorderPages } from "../controllers/pagesController.js";

import { Router } from "express";
const router = Router({ mergeParams: true });

// route is "/games/:gameId/pages"
router.put("/reorder", requireAdmin, reorderPages);
router.get("/", pagesController.getPages);
router.post("/", requireAdmin, pagesController.postPage);
router.get("/by-slug/:slug", pagesController.getPage);
router.delete("/by-id/:pageId", requireAdmin, pagesController.deletePage);
router.put("/by-id/:pageId", requireAdmin, pagesController.updatePage);
router.post("/by-id/:pageId/blocks", requireAdmin, pagesController.createBlockForPage);
router.put("/by-id/:pageId/blocks", requireAdmin, pagesController.updateBlocksForPage);

export default router;