import { Router } from "express";
const router = Router();

import authController from "../controllers/authController.js";
import indexController from "../controllers/indexController.js";
import gameController from "../controllers/gameController.js";
import { validateSignup } from "../validators/authValidators.js";

router.post("/sign-up", [validateSignup, authController.addUser]);

router.post("/log-in", authController.login);

router.get("/log-out", authController.logout);

router.get("/", indexController.getIndex);

router.get("/games", gameController.getGames);

router.post("/games", gameController.postGame);

router.get("/games/:gameId/checklists", gameController.getChecklists);

router.post("/games/:gameId/checklists", gameController.postChecklist);

router.get("/checklists/:checklistId", gameController.getChecklistItems);

router.post("/checklists/:checklistId", gameController.postChecklistItem);

router.get("/checklistItems/:id", gameController.getChecklistItem);

router.put("/checklistItems/:itemId", gameController.updateChecklistItem);

router.get("/tags", gameController.getTags);

router.post("/tags/:tagTitle", gameController.postTag);

export default router;
