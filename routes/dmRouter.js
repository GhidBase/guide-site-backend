import { Router } from "express";
import { requireAuth, requireAdmin } from "../config/auth.js";
import dmController from "../controllers/dmController.js";

const router = Router();

router.get("/", requireAuth, dmController.getThreads);
router.get("/:userId", requireAdmin, dmController.getThread);
router.post("/", requireAuth, dmController.userSendMessage);
router.post("/:userId", requireAdmin, dmController.adminReply);
router.delete("/:messageId", requireAdmin, dmController.deleteMessage);

export default router;
