import db from "../db/authQueries.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import passport from "passport";

async function addUser(req, res, next) {
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
        res.json(user);
    });
}

function logout(req, res, next) {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
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
            return res.json(user);
        });
    })(req, res, next);
}

async function getUser(req, res) {
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: "Not logged in" });
    }
}

export default { addUser, logout, login, getUser };
