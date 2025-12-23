// Environment variables
import dotenv from "dotenv";
dotenv.config();

// Express
import express from "express";
import router from "./routes/router.js";
import pagesRouter from "./routes/pagesRouter.js";
import blocksRouter from "./routes/blocksRouter.js";
import navbarRouter from "./routes/navbarRouter.js";
import filesRouter from "./routes/filesRouter.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

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
    }),
);

app.use(passport.session());

import cors from "cors";
app.use(cors());

// To receive JSON
app.use(express.json());

// To allow form inputs
// Without this, form submissions would have
// an empty req.body
// "extended: true" allows nested objects in the data
app.use(express.urlencoded({ extended: true }));

app.use("/navbar", navbarRouter);
app.use("/blocks", blocksRouter);
app.use("/pages", pagesRouter);
app.use("/files", filesRouter);
app.use("/", router);

const PORT = process.env.PORT;
app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log("App started");
});
