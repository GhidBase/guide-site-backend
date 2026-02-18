import { requireEditor } from "../config/auth.js";
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
router.post("/", requireEditor, createSection);
router.delete("/delete/:id", requireEditor, deleteSection);
router.put("/rename/:id", requireEditor, renameSection);
router.put("/reorder", requireEditor, reorderSection);
router.get("/navbar", getNavbar);
router.put("/:id", requireEditor, changePageSection);
export default router;
