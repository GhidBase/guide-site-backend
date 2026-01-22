import pagesRouter from "./pagesRouter.js";
import blocksRouter from "./blocksRouter.js";
import navbarRouter from "./navbarRouter.js";
import filesRouter from "./filesRouter.js";
import defaultRouter from "./router.js";

import { Router } from "express";
const router = Router({ mergeParams: true });

router.use("/navbar", navbarRouter);
router.use("/blocks", blocksRouter);
router.use("/pages", pagesRouter);
router.use("/files", filesRouter);
router.use("/", defaultRouter);

export default router