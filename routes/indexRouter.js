import indexController from "../controllers/indexController.js";
import gameController from "../controllers/gameController.js";

import { Router } from "express";
const router = Router({ mergeParams: true });

router.get("/", indexController.getIndex);


export default router
