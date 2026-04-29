import pagesRouter from "./pagesRouter.js";
import blocksRouter from "./blocksRouter.js";
import navbarRouter from "./navbarRouter.js";
import filesRouter from "./filesRouter.js";
import gameImagesRouter from "./gameImagesRouter.js";
import unitsRouter from "./unitsRouter.js";
import tierRouter from "./tierRouter.js";
import defaultRouter from "./router.js";
import gameEditorController from "../controllers/gameEditorController.js";
import chatController from "../controllers/chatController.js";
import { requireAdmin, requireAuth } from "../config/auth.js";

import { Router } from "express";
const router = Router({ mergeParams: true });


// route - /games
router.use("/:gameId/images", gameImagesRouter);
router.use("/:gameId", unitsRouter);
router.use("/:gameId", tierRouter);
router.use("/:gameId/navbar", navbarRouter);
router.use("/:gameId/blocks", blocksRouter);
router.use("/:gameId/pages", pagesRouter);
router.use("/:gameId/files", filesRouter);

// per-game editors
router.get("/:gameId/editors", gameEditorController.getGameEditors);
router.post("/:gameId/editors", requireAdmin, gameEditorController.addGameEditor);
router.delete("/:gameId/editors/:userId", requireAdmin, gameEditorController.removeGameEditor);

// game chat
router.get("/:gameId/chat", requireAuth, chatController.getChatMessages);
router.post("/:gameId/chat", requireAuth, chatController.postChatMessage);
router.delete("/:gameId/chat/:messageId", requireAuth, chatController.deleteChatMessage);

router.use("/", defaultRouter);

export default router
