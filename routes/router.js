import { Router } from "express";
const router = Router();

import authController from "../controllers/authController.js";
import indexController from "../controllers/indexController.js";
import gameController from "../controllers/gameController.js";
import { validateSignup } from "../validators/authValidators.js";
import requireAdmin from "../config/requireAdmin.js";
// http://localhost:3000/pages/stun-guide?type=title&gameId=1
// follow this route
router.post("/sign-up", requireAdmin, [validateSignup, authController.addUser]);
router.post("/log-in", requireAdmin, authController.login);
router.get("/log-out", authController.logout);
router.get("/", indexController.getIndex);
router.get("/games", gameController.getGames);
router.get("/games/:gameId", gameController.getGame);
router.post("/games", requireAdmin, gameController.postGame);
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
