// Environment variables
import dotenv from "dotenv";
dotenv.config();

// Express
import express from "express";
import router from "./routes/router.js";
const app = express();

// Authentication
import session from "express-session";
import passport from "passport";
import "./config/passport.js";
import { prisma } from "./lib/prisma.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

app.use(
    session({
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new PrismaSessionStore(prisma, {
            checkPeriod: 2 * 60 * 1000, //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }),
    })
);
app.use(passport.session());

// To receive JSON
app.use(express.json())

// To allow form inputs
// Without this, form submissions would have
// an empty req.body
// "extended: true" allows nested objects in the data
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

const PORT = process.env.PORT;
app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log("App started");
});
