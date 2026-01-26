import { Router } from "express";
const router = Router({ mergeParams: true });

import authController from "../controllers/authController.js";
import gameController from "../controllers/gameController.js";
import { validateSignup } from "../validators/authValidators.js";
import requireAdmin from "../config/requireAdmin.js";

// Not using these at the moment
router.post("/sign-up", requireAdmin, [validateSignup, authController.addUser]);
router.post("/log-in", requireAdmin, authController.login);
router.get("/log-out", authController.logout);

// route is "/games/"
router.get("/", gameController.getGames);
router.get("/by-slug/:gameSlug", gameController.getGameByTitle);
router.get("by-id/:gameId", gameController.getGame);

// There's no interface for these yet, revisit later
router.post("/", requireAdmin, gameController.postGame); //wip
router.put("/:gameId", requireAdmin, gameController.updateGame);
router.get("/games/:gameId/checklists", gameController.getChecklists);
router.post(
    "/games/:gameId/checklists",
    requireAdmin,
    gameController.postChecklist,
);
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
