import { Router } from "express";
import { requireAdmin } from "../config/auth.js";
import presetsController from "../controllers/presetsController.js";

const router = Router();

router.get("/", requireAdmin, presetsController.getPresets);
router.post("/", requireAdmin, presetsController.createPreset);
router.put("/:id", requireAdmin, presetsController.updatePreset);
router.delete("/:id", requireAdmin, presetsController.deletePreset);

export default router;
