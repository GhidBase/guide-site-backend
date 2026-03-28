import { Router } from "express";
import { requireAuth, requireAdmin } from "../config/auth.js";
import idleController from "../controllers/idleController.js";

const router = Router();

router.get("/character", requireAuth, idleController.getCharacter);
router.post("/character/tick", requireAuth, idleController.tick);
router.post("/character/equip/:inventoryItemId", requireAuth, idleController.equip);
router.delete("/character/item/:itemId", requireAuth, idleController.discard);
router.delete("/character/items", requireAuth, idleController.discardMany);
router.post("/character/zone", requireAuth, idleController.changeZone);
router.post("/character/reset", requireAuth, idleController.reset);
router.post("/character/revive", requireAuth, idleController.revive);
router.get("/enemies", idleController.getEnemies);
router.get("/zones", idleController.getZones);

export default router;
