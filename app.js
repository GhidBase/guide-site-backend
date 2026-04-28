// Environment variables
import dotenv from "dotenv";
dotenv.config();

// Express
import express from "express";
import navbarsRouter from "./routes/navbarRouter.js";
import sectionsRouter from "./routes/sectionsRouter.js";

// unused here
// import multer from "multer";
// const upload = multer({ dest: "uploads/" });

const app = express();

import gamesRouter from "./routes/gamesRouter.js";
import indexRouter from "./routes/indexRouter.js";
import reviewRouter from "./routes/reviewRouter.js";
import authRoutes from "./routes/authRoutes.js";
import commentsRouter from "./routes/commentsRouter.js";
import pagesRouter from "./routes/pagesRouter.js";
import blocksRouter from "./routes/blocksRouter.js";
import siteImagesRouter from "./routes/siteImagesRouter.js";
import idleRouter from "./routes/idleRouter.js";
import fmLeadsRouter from "./routes/fmLeadsRouter.js";
import presetsRouter from "./routes/presetsRouter.js";

// Authentication
import session from "express-session";
import passport from "passport";
import "./config/passport.js";
import { prisma } from "./lib/prisma.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

app.set("trust proxy", 1);

app.use(
    session({
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        },
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

app.use(
    cors({
        origin: process.env.FRONTEND_URL.split(","),
        credentials: true,
    }),
);

// To receive JSON
app.use(express.json());

// To allow form inputs
// Without this, form submissions would have
// an empty req.body
// "extended: true" allows nested objects in the data
app.use(express.urlencoded({ extended: true }));

app.use("/", commentsRouter);
app.use("/games", gamesRouter);
app.use("/images", siteImagesRouter);
app.use("/pages", pagesRouter);
app.use("/blocks", blocksRouter);
app.use("/sections", sectionsRouter);
app.use("/navbars", navbarsRouter);
app.use("/reviews", reviewRouter);
app.use("/idle", idleRouter);
app.use("/fm-leads", fmLeadsRouter);
app.use("/presets", presetsRouter);
app.use("/fm", express.static("public/fm"));
app.use("/", indexRouter);
app.use("/", authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log("App started");
});
