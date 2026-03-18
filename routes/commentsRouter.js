import { Router } from "express";
import { requireAuth, requireAdmin } from "../config/auth.js";
import commentsController from "../controllers/commentsController.js";

const router = Router({ mergeParams: true });

router.get("/games/:gameId/comments/all", requireAdmin, commentsController.getAllCommentsForGame);
router.get("/pages/:pageId/comments", commentsController.getComments);
router.post("/pages/:pageId/comments", requireAuth, commentsController.postComment);
router.post("/comments/:commentId/replies", requireAuth, commentsController.postReply);
router.put("/comments/:commentId", requireAuth, commentsController.updateComment);
router.delete("/comments/:commentId", requireAuth, commentsController.deleteComment);
router.post("/comments/:commentId/upvote", requireAuth, commentsController.upvoteComment);

export default router;
