import requireAdmin from "../config/requireAdmin.js";
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
router.post("/", requireAdmin, createSection);
router.delete("/delete/:id", requireAdmin, deleteSection);
router.put("/rename/:id", requireAdmin, renameSection);
router.put("/reorder", requireAdmin, reorderSection);
router.get("/navbar", getNavbar);
router.put("/:id", requireAdmin, changePageSection)
export default router;
