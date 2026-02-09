import { Router } from "express";
const router = Router({ mergeParams: true });
import { getMapDataFromDB } from "../controllers/navbarController.js";

router.get("/", getMapDataFromDB);

export default router;

