import blocksController from "../controllers/blocksController.js";
import { Router } from "express";
const router = Router();

// route is "/blocks"
router.delete("/:blockId", blocksController.deleteBlock);
router.put("/:blockId", blocksController.updateBlock);

export default router;
