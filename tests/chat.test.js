import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../lib/prisma.js", () => ({ prisma: {} }));

vi.mock("../db/chatQueries.js", () => ({
    default: {
        getChatMessages: vi.fn(),
        createChatMessage: vi.fn(),
        getChatMessage: vi.fn(),
        deleteChatMessage: vi.fn(),
    },
}));

vi.mock("../config/auth.js", () => ({
    requireAuth: (req, res, next) => next(),
    requireAdmin: (req, res, next) => next(),
}));

import chatDb from "../db/chatQueries.js";
import chatController from "../controllers/chatController.js";
import { requireAuth } from "../config/auth.js";

function buildApp(user = { id: 1, username: "alice", role: "USER" }) {
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => { req.user = user; next(); });
    const router = express.Router({ mergeParams: true });
    router.get("/:gameId/chat", requireAuth, chatController.getChatMessages);
    router.post("/:gameId/chat", requireAuth, chatController.postChatMessage);
    router.delete("/:gameId/chat/:messageId", requireAuth, chatController.deleteChatMessage);
    app.use("/games", router);
    return app;
}

const mockMsg = { id: 1, userId: 1, username: "alice", text: "hello", type: "message", createdAt: "2026-01-01T00:00:00.000Z" };

beforeEach(() => vi.clearAllMocks());

describe("GET /games/:gameId/chat", () => {
    it("returns messages ordered by createdAt asc", async () => {
        chatDb.getChatMessages.mockResolvedValue([mockMsg]);
        const res = await request(buildApp()).get("/games/1/chat");
        expect(res.status).toBe(200);
        expect(res.body).toEqual([mockMsg]);
        expect(chatDb.getChatMessages).toHaveBeenCalledWith(1, 100);
    });

    it("respects custom limit query param", async () => {
        chatDb.getChatMessages.mockResolvedValue([]);
        await request(buildApp()).get("/games/1/chat?limit=50");
        expect(chatDb.getChatMessages).toHaveBeenCalledWith(1, 50);
    });
});

describe("POST /games/:gameId/chat", () => {
    it("creates a message and returns 201", async () => {
        chatDb.createChatMessage.mockResolvedValue(mockMsg);
        const res = await request(buildApp()).post("/games/1/chat").send({ text: "hello" });
        expect(res.status).toBe(201);
        expect(res.body).toEqual(mockMsg);
        expect(chatDb.createChatMessage).toHaveBeenCalledWith(expect.objectContaining({
            gameId: 1, userId: 1, username: "alice", text: "hello",
        }));
    });

    it("returns 400 if text is empty", async () => {
        const res = await request(buildApp()).post("/games/1/chat").send({ text: "" });
        expect(res.status).toBe(400);
    });

    it("returns 400 if text exceeds 500 chars", async () => {
        const res = await request(buildApp()).post("/games/1/chat").send({ text: "a".repeat(501) });
        expect(res.status).toBe(400);
    });

    it("returns 400 if text is missing", async () => {
        const res = await request(buildApp()).post("/games/1/chat").send({});
        expect(res.status).toBe(400);
    });
});

describe("DELETE /games/:gameId/chat/:messageId", () => {
    it("lets owner delete their own message", async () => {
        chatDb.getChatMessage.mockResolvedValue({ id: 1, userId: 1 });
        chatDb.deleteChatMessage.mockResolvedValue({});
        const res = await request(buildApp({ id: 1, username: "alice", role: "USER" }))
            .delete("/games/1/chat/1");
        expect(res.status).toBe(204);
    });

    it("lets admin delete anyone's message", async () => {
        chatDb.getChatMessage.mockResolvedValue({ id: 1, userId: 2 });
        chatDb.deleteChatMessage.mockResolvedValue({});
        const res = await request(buildApp({ id: 99, username: "admin", role: "ADMIN" }))
            .delete("/games/1/chat/1");
        expect(res.status).toBe(204);
    });

    it("returns 403 if non-owner non-admin tries to delete", async () => {
        chatDb.getChatMessage.mockResolvedValue({ id: 1, userId: 2 });
        const res = await request(buildApp({ id: 1, username: "alice", role: "USER" }))
            .delete("/games/1/chat/1");
        expect(res.status).toBe(403);
    });

    it("returns 404 if message not found", async () => {
        chatDb.getChatMessage.mockResolvedValue(null);
        const res = await request(buildApp()).delete("/games/1/chat/999");
        expect(res.status).toBe(404);
    });
});
