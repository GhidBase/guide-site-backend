import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../lib/prisma.js", () => ({ prisma: {} }));

vi.mock("../db/authQueries.js", () => ({
    default: {
        addUser: vi.fn(),
        getUser: vi.fn(),
        checkUserExists: vi.fn(),
        getUserById: vi.fn(),
        updateUserRole: vi.fn(),
        getAllUsers: vi.fn(),
    },
}));

vi.mock("../config/auth.js", () => ({
    requireAdmin: (req, res, next) => next(),
    requireAuth: (req, res, next) => next(),
}));

import authDb from "../db/authQueries.js";
import authController from "../controllers/authController.js";
import { requireAdmin } from "../config/auth.js";

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => { req.user = { id: 1, role: "ADMIN" }; next(); });
    app.get("/users", requireAdmin, authController.getAllUsers);
    return app;
}

const app = buildApp();

beforeEach(() => vi.clearAllMocks());

describe("GET /users", () => {
    it("returns all users when no search param", async () => {
        authDb.getAllUsers.mockResolvedValue([
            { id: 1, username: "alice", role: "USER" },
            { id: 2, username: "bob", role: "EDITOR" },
        ]);

        const res = await request(app).get("/users");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(authDb.getAllUsers).toHaveBeenCalledWith(undefined);
    });

    it("passes search param to db query", async () => {
        authDb.getAllUsers.mockResolvedValue([{ id: 1, username: "alice", role: "USER" }]);

        const res = await request(app).get("/users?search=ali");

        expect(res.status).toBe(200);
        expect(authDb.getAllUsers).toHaveBeenCalledWith("ali");
    });

    it("returns empty array when no match", async () => {
        authDb.getAllUsers.mockResolvedValue([]);
        const res = await request(app).get("/users?search=zzz");
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });
});
