import { Router } from "express";
import fmLeadsController from "../controllers/fmLeadsController.js";

const router = Router();

router.get("/", fmLeadsController.getLeads);
router.get("/pending", fmLeadsController.getPending);
router.post("/", fmLeadsController.upsertLead);
router.post("/web", fmLeadsController.createFromWeb);
router.delete("/", fmLeadsController.deleteAllLeads);
router.delete("/:primaryKey", fmLeadsController.deleteLead);

export default router;
