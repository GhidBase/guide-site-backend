import { Router } from "express";
import reviewController from "../controllers/reviewController.js";
import { requireEditor } from "../config/auth.js";

const router = Router();

router.get("/", requireEditor, reviewController.getAllPendingReviews);
router.post("/:id/accept", requireEditor, reviewController.acceptReview);
router.post("/:id/refuse", requireEditor, reviewController.refuseReview);

export default router;
