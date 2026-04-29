import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../lib/prisma.js", () => ({ prisma: {} }));

vi.mock("../db/gameEditorQueries.js", () => ({
    default: {
        getGameEditors: vi.fn(),
        addGameEditor: vi.fn(),
        removeGameEditor: vi.fn(),
        getGameEditorUser: vi.fn(),
    },
}));

vi.mock("../db/chatQueries.js", () => ({
    default: {
        createChatMessage: vi.fn(),
        getChatMessages: vi.fn(),
        getChatMessage: vi.fn(),
        deleteChatMessage: vi.fn(),
    },
}));

vi.mock("../config/auth.js", () => ({
    requireAdmin: (req, res, next) => next(),
    requireAuth: (req, res, next) => next(),
}));

import db from "../db/gameEditorQueries.js";
import chatDb from "../db/chatQueries.js";
import gameEditorController from "../controllers/gameEditorController.js";
import { requireAdmin } from "../config/auth.js";

function buildApp(role = "ADMIN") {
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
        req.user = { id: 99, username: "admin", role };
        next();
    });
    const router = express.Router({ mergeParams: true });
    router.get("/:gameId/editors", gameEditorController.getGameEditors);
    router.post("/:gameId/editors", requireAdmin, gameEditorController.addGameEditor);
    router.delete("/:gameId/editors/:userId", requireAdmin, gameEditorController.removeGameEditor);
    app.use("/games", router);
    return app;
}

const app = buildApp();

beforeEach(() => vi.clearAllMocks());

describe("GET /games/:gameId/editors", () => {
    it("returns editors list", async () => {
        db.getGameEditors.mockResolvedValue([
            { user: { id: 1, username: "alice" }, assignedAt: "2026-01-01T00:00:00.000Z" },
        ]);

        const res = await request(app).get("/games/1/editors");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ id: 1, username: "alice", assignedAt: "2026-01-01T00:00:00.000Z" }]);
    });

    it("returns empty array when no editors", async () => {
        db.getGameEditors.mockResolvedValue([]);
        const res = await request(app).get("/games/1/editors");
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });
});

describe("POST /games/:gameId/editors", () => {
    it("adds an editor and returns 201", async () => {
        db.addGameEditor.mockResolvedValue({
            user: { id: 2, username: "bob" },
            assignedAt: "2026-01-01T00:00:00.000Z",
        });
        chatDb.createChatMessage.mockResolvedValue({});

        const res = await request(app).post("/games/1/editors").send({ userId: 2 });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ id: 2, username: "bob", assignedAt: "2026-01-01T00:00:00.000Z" });
        expect(db.addGameEditor).toHaveBeenCalledWith(1, 2);
    });

    it("posts editor_granted system message to chat", async () => {
        db.addGameEditor.mockResolvedValue({
            user: { id: 2, username: "bob" },
            assignedAt: "2026-01-01T00:00:00.000Z",
        });
        chatDb.createChatMessage.mockResolvedValue({});

        await request(app).post("/games/1/editors").send({ userId: 2 });

        expect(chatDb.createChatMessage).toHaveBeenCalledWith(expect.objectContaining({
            type: "editor_granted",
            text: "bob was granted editor access by admin",
            gameId: 1,
        }));
    });
});

describe("DELETE /games/:gameId/editors/:userId", () => {
    it("removes an editor and returns 204", async () => {
        db.getGameEditorUser.mockResolvedValue({ user: { id: 2, username: "bob" } });
        db.removeGameEditor.mockResolvedValue({});
        chatDb.createChatMessage.mockResolvedValue({});

        const res = await request(app).delete("/games/1/editors/2");

        expect(res.status).toBe(204);
        expect(db.removeGameEditor).toHaveBeenCalledWith(1, 2);
    });

    it("returns 404 if editor not found", async () => {
        db.getGameEditorUser.mockResolvedValue(null);
        const res = await request(app).delete("/games/1/editors/999");
        expect(res.status).toBe(404);
    });

    it("posts editor_revoked system message to chat", async () => {
        db.getGameEditorUser.mockResolvedValue({ user: { id: 2, username: "bob" } });
        db.removeGameEditor.mockResolvedValue({});
        chatDb.createChatMessage.mockResolvedValue({});

        await request(app).delete("/games/1/editors/2");

        expect(chatDb.createChatMessage).toHaveBeenCalledWith(expect.objectContaining({
            type: "editor_revoked",
            text: "bob's editor access was revoked",
        }));
    });
});
