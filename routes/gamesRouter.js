import pagesRouter from "./pagesRouter.js";
import blocksRouter from "./blocksRouter.js";
import navbarRouter from "./navbarRouter.js";
import filesRouter from "./filesRouter.js";
import defaultRouter from "./router.js";

import { Router } from "express";
const router = Router({ mergeParams: true });



router.use("/", defaultRouter);
router.use("/:gameId/navbar", navbarRouter); // good
router.use("/:gameId/blocks", blocksRouter); // good
router.use("/:gameId/pages", pagesRouter); // good
router.use("/:gameId/files", filesRouter); // good

export default router
