import { Router } from "express";
import unitsController from "../controllers/unitsController.js";
import boardController from "../controllers/boardController.js";
import { requireAdmin } from "../config/auth.js";

const router = Router({ mergeParams: true });

// Units
router.get("/unit-categories", unitsController.getUnitCategories);
router.post("/unit-categories", requireAdmin, unitsController.createUnitCategory);
router.delete("/unit-categories/:id", requireAdmin, unitsController.deleteUnitCategory);
router.post("/units", requireAdmin, unitsController.createUnit);
router.delete("/units/:id", requireAdmin, unitsController.deleteUnit);

// Boards
router.get("/boards", boardController.getBoards);
router.post("/boards", requireAdmin, boardController.createBoard);
router.put("/boards/:boardId", requireAdmin, boardController.updateBoard);
router.delete("/boards/:boardId", requireAdmin, boardController.deleteBoard);

export default router;
