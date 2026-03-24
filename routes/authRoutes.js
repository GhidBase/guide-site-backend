import { Router } from "express";
import { validateSignup } from "../validators/authValidators.js";
import authController from "../controllers/authController.js";
import { requireAdmin } from "../config/auth.js";
import passport from "passport";

const router = Router();

router.post("/sign-up", [validateSignup, authController.addUser]);
router.post("/log-in", authController.login);
router.get("/log-out", authController.logout);
router.get("/user", authController.getUser);
router.put("/users/:userId/role", requireAdmin, authController.updateUserRole);
router.get("/users", requireAdmin, authController.getAllUsers);

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
    (req, res) => res.redirect(process.env.FRONTEND_URL),
);

export default router;
