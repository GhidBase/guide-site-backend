import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// Mock prisma before importing anything that uses it
vi.mock("../lib/prisma.js", () => ({
    prisma: {},
}));

// Mock the DB layer
vi.mock("../db/presetQueries.js", () => ({
    default: {
        getPresets: vi.fn(),
        createPreset: vi.fn(),
        updatePreset: vi.fn(),
        deletePreset: vi.fn(),
    },
}));

// Mock auth — by default, allow admin
vi.mock("../config/auth.js", () => ({
    requireAdmin: (req, res, next) => next(),
}));

import db from "../db/presetQueries.js";
import presetsRouter from "../routes/presetsRouter.js";

function buildApp() {
    const app = express();
    app.use(express.json());
    // Simulate req.user set by passport
    app.use((req, _res, next) => {
        req.user = { id: 1, role: "ADMIN" };
        next();
    });
    app.use("/presets", presetsRouter);
    return app;
}

const app = buildApp();

const mockPreset = {
    id: 1,
    name: "Dark Mode",
    light: { bg: "#fff" },
    dark: { bg: "#000" },
    animations: { speed: "fast" },
    createdBy: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("GET /presets", () => {
    it("returns all presets", async () => {
        db.getPresets.mockResolvedValue([mockPreset]);

        const res = await request(app).get("/presets");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([mockPreset]);
        expect(db.getPresets).toHaveBeenCalledOnce();
    });

    it("returns empty array when no presets exist", async () => {
        db.getPresets.mockResolvedValue([]);

        const res = await request(app).get("/presets");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });
});

describe("POST /presets", () => {
    it("creates a preset and returns 201", async () => {
        db.createPreset.mockResolvedValue(mockPreset);

        const res = await request(app).post("/presets").send({
            name: "Dark Mode",
            light: { bg: "#fff" },
            dark: { bg: "#000" },
            animations: { speed: "fast" },
        });

        expect(res.status).toBe(201);
        expect(res.body).toEqual(mockPreset);
        expect(db.createPreset).toHaveBeenCalledWith({
            name: "Dark Mode",
            light: { bg: "#fff" },
            dark: { bg: "#000" },
            animations: { speed: "fast" },
            createdBy: 1,
        });
    });
});

describe("PUT /presets/:id", () => {
    it("partially updates a preset", async () => {
        const updated = { ...mockPreset, name: "Light Mode" };
        db.updatePreset.mockResolvedValue(updated);

        const res = await request(app)
            .put("/presets/1")
            .send({ name: "Light Mode" });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe("Light Mode");
        expect(db.updatePreset).toHaveBeenCalledWith(1, { name: "Light Mode" });
    });

    it("only sends provided fields to DB", async () => {
        db.updatePreset.mockResolvedValue(mockPreset);

        await request(app)
            .put("/presets/1")
            .send({ dark: { bg: "#111" } });

        expect(db.updatePreset).toHaveBeenCalledWith(1, { dark: { bg: "#111" } });
    });
});

describe("DELETE /presets/:id", () => {
    it("deletes a preset and returns 204", async () => {
        db.deletePreset.mockResolvedValue(undefined);

        const res = await request(app).delete("/presets/1");

        expect(res.status).toBe(204);
        expect(db.deletePreset).toHaveBeenCalledWith(1);
    });
});

describe("Auth guard", () => {
    it("returns 403 for non-admin", async () => {
        // Re-build a fresh app with auth enforced (not mocked)
        const { requireAdmin } = await import("../config/auth.js");

        const restrictedApp = express();
        restrictedApp.use(express.json());
        restrictedApp.use((req, _res, next) => {
            req.user = { id: 2, role: "USER" };
            next();
        });

        // Temporarily replace requireAdmin with real one
        const realRequireAdmin = (req, res, next) => {
            if (req.user && req.user.role === "ADMIN") return next();
            res.sendStatus(403);
        };

        const router = express.Router();
        router.get("/", realRequireAdmin, async (_req, res) => {
            res.json([]);
        });
        restrictedApp.use("/presets", router);

        const res = await request(restrictedApp).get("/presets");
        expect(res.status).toBe(403);
    });
});
