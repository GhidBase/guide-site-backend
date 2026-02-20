import { Router } from "express";
import { validateSignup } from "../validators/authValidators.js";
import authController from "../controllers/authController";
import { requireAdmin } from "../config/auth";

const router = Router();

router.post("/sign-up", [validateSignup, authController.addUser]);
router.post("/log-in", authController.login);
router.get("/log-out", authController.logout);
router.get("/user", authController.getUser);
router.put("/users/:userId/role", requireAdmin, authController.updateUserRole);
router.get("/users", requireAdmin, authController.getAllUsers);

export default router;
