import { Router } from "express";
import { requireAuth, requireAdmin } from "../config/auth.js";
import idleController from "../controllers/idleController.js";

const router = Router();

router.get("/character", requireAuth, idleController.getCharacter);
router.post("/character/tick", requireAuth, idleController.tick);
router.post("/character/equip/:inventoryItemId", requireAuth, idleController.equip);
router.post("/character/zone", requireAuth, idleController.changeZone);
router.get("/enemies", idleController.getEnemies);
router.get("/zones", idleController.getZones);

export default router;
