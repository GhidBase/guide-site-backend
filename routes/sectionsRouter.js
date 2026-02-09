import requireAdmin from "../config/requireAdmin.js";
import createSection, { renameSection, reorderSection, getNavbar } from "../controllers/sectionsController.js";
import { deleteSection } from "../controllers/sectionsController.js";
import { Router } from "express";
const router = Router();

router.post("/", requireAdmin, createSection)
router.delete("/delete/:id", requireAdmin, deleteSection)
router.put("/rename/:id", requireAdmin, renameSection)
router.put("/reorder", requireAdmin, reorderSection)
router.get("/navbar", getNavbar)

export default router;