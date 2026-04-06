import { Router } from "express";
import fmGamesController from "../controllers/fmGamesController.js";

const router = Router();

router.get("/", fmGamesController.getGames);
router.get("/pending", fmGamesController.getPending);
router.post("/", fmGamesController.upsertGame);
router.post("/web", fmGamesController.createFromWeb);
router.delete("/:primaryKey", fmGamesController.deleteGame);

export default router;
