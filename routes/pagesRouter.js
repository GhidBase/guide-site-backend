import { requireAdmin, requireAuth, requireEditor } from "../config/auth.js";
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
router.post("/by-id/:pageId/view", pagesController.incrementViews);
router.post("/by-id/:pageId/claim", requireAuth, pagesController.claimPage);
router.delete("/by-id/:pageId/claim", requireAuth, pagesController.unclaimPage);
router.get("/analytics", requireEditor, pagesController.getAnalytics);
router.get("/view-leaderboard", pagesController.getViewLeaderboard);
router.post(
    "/by-id/:pageId/blocks",
    requireAuth,
    pagesController.createBlockForPage,
);
router.put(
    "/by-id/:pageId/blocks",
    requireAuth,
    pagesController.updateBlocksForPage,
);

export default router;
