import { Router } from "express";
import fmGamesController from "../controllers/fmGamesController.js";

const router = Router();

router.get("/", fmGamesController.getGames);
router.post("/", fmGamesController.upsertGame);
router.delete("/:primaryKey", fmGamesController.deleteGame);

export default router;
