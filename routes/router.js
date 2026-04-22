import { Router } from "express";
const router = Router({ mergeParams: true });

import gameController from "../controllers/gameController.js";
import { requireAdmin } from "../config/auth.js";

// route is "/games/"
router.get("/", gameController.getGames);
router.get("/by-slug/:gameSlug", gameController.getGameByTitle);
router.get("/by-id/:gameId", gameController.getGame);
router.get("/by-id/:gameId/leaderboard", gameController.getLeaderboard);

// There's no interface for these yet, revisit later
router.post("/", requireAdmin, gameController.postGame); //wip
router.put("/:gameId", requireAdmin, gameController.updateGame);
router.put("/:gameId/theme", requireAdmin, gameController.updateTheme);
router.get("/:gameId/checklists", gameController.getChecklists);
router.post("/:gameId/checklists", requireAdmin, gameController.postChecklist);
router.put("/:gameId/checklists/:checklistId", requireAdmin, gameController.updateChecklist);
router.get("/checklists/:checklistId", gameController.getChecklistItems);
router.post(
    "/checklists/:checklistId",
    requireAdmin,
    gameController.postChecklistItem,
);
router.get("/checklistItems/:id", gameController.getChecklistItem);
router.delete(
    "/checklistItems/:itemId/tags/:tagId",
    requireAdmin,
    gameController.deleteItemAndTagConnection,
);
router.put(
    "/checklistItems/:itemId",
    requireAdmin,
    gameController.updateChecklistItem,
);
router.get("/tags", gameController.getTags);
router.post("/tags/:tagTitle", requireAdmin, gameController.postTag);

export default router;
