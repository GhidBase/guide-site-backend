import indexController from "../controllers/indexController.js";
import gameController from "../controllers/gameController.js";

import { Router } from "express";
import pagesController from "../controllers/pagesController.js";
const router = Router({ mergeParams: true });

router.get("/pages/by-slug/:pageSlug", pagesController.getNonGamePage);
router.get("/pages", pagesController.getNonGamePages);
router.get("/", indexController.getIndex);

export default router;
