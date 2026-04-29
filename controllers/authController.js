import db from "../db/authQueries.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import passport from "passport";

async function addUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    const { username, password, adminSecret } = req.body;

    const userExists = await db.checkUserExists(username);
    if (userExists) {
        return res.status(400).json({
            errors: [{ msg: "Account already exists" }],
        });
    }

    const hashed_password = await bcrypt.hash(password, 10);
    let role = "USER";
    if (adminSecret === process.env.ADMIN_SECRET) {
        role = "ADMIN";
    }

    const user = await db.addUser(username, hashed_password, role);
    req.login(user, function (err) {
        if (err) {
            return next(err);
        }
        res.json({ message: "Successfully signed up" });
    });
}

async function logout(req, res, next) {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.json({ message: "Logged out successfully" });
    });
}

function login(req, res, next) {
    passport.authenticate("local", (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: "Authentication failed" });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.json({ message: "Successfully logged in" });
        });
    })(req, res, next);
}

async function getUser(req, res) {
    if (req.user) {
        // Removes their password from the response for safety, even if its hashed
        const { password, ...user } = req.user;
        res.json(user);
    } else {
        res.status(401).json({ message: "Not logged in" });
    }
}

async function updateUserRole(req, res) {
    const userId = +req.params.userId;
    const { newRole } = req.body;

    if (!userId || !newRole) {
        return res.status(400).json({ message: "Missing userId or newRole" });
    }

    const validRoles = ["USER", "EDITOR", "ADMIN"];
    if (!validRoles.includes(newRole)) {
        return res.status(400).json({ message: "Invalid role specified" });
    }

    try {
        const updatedUser = await db.updateUserRole(userId, newRole);
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // Take out the password from the response for security
        const { password, ...user } = updatedUser;
        res.json({
            message: "User role updated successfully",
            user,
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Failed to update user role" });
    }
}

async function getAllUsers(req, res) {
    try {
        const users = await db.getAllUsers(req.query.search);
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
}

export default { addUser, logout, login, getUser, updateUserRole, getAllUsers };
