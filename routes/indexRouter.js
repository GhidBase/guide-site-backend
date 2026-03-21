import indexController from "../controllers/indexController.js";
import gameController from "../controllers/gameController.js";
import pagesController from "../controllers/pagesController.js";

import { Router } from "express";
const router = Router({ mergeParams: true });

router.get("/leaderboard", gameController.getGlobalLeaderboard);
router.get("/pages/by-slug/:pageSlug", pagesController.getNonGamePage);
router.get("/pages", pagesController.getNonGamePages);
router.get("/", indexController.getIndex);

export default router;
