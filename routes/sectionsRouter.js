import { requireAuth } from "../config/auth.js";
import createSection, {
    renameSection,
    reorderSection,
    deleteSection,
    changePageSection,
} from "../controllers/sectionsController.js";
import { getNavbar } from "../controllers/navbarController.js";
import { Router } from "express";
const router = Router();

// route is /sections
router.post("/", requireAuth, createSection);
router.delete("/delete/:id", requireAuth, deleteSection);
router.put("/rename/:id", requireAuth, renameSection);
router.put("/reorder", requireAuth, reorderSection);
router.get("/navbar", getNavbar);
router.put("/:id", requireAuth, changePageSection);
export default router;
