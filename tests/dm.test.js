import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../db/dmQueries.js", () => ({
    default: {
        getAllThreads: vi.fn(),
        getThreadMessages: vi.fn(),
        createMessage: vi.fn(),
        getLastUserMessage: vi.fn(),
        getMessage: vi.fn(),
        deleteMessage: vi.fn(),
    },
}));

import db from "../db/dmQueries.js";
import dmController from "../controllers/dmController.js";

const ADMIN = { id: 1, username: "admin", role: "ADMIN" };
const USER  = { id: 2, username: "user",  role: "USER" };

function buildApp(user) {
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => { req.user = user; next(); });
    app.get("/dms", dmController.getThreads);
    app.get("/dms/:userId", dmController.getThread);
    app.post("/dms", dmController.userSendMessage);
    app.post("/dms/:userId", dmController.adminReply);
    app.delete("/dms/:messageId", dmController.deleteMessage);
    return app;
}

beforeEach(() => vi.clearAllMocks());

// ─── GET /dms ────────────────────────────────────────────────────────────────

describe("GET /dms", () => {
    it("admin gets all threads", async () => {
        db.getAllThreads.mockResolvedValue([{ userId: 2, username: "user", lastMessage: "hi", updatedAt: new Date(), unreadCount: 1 }]);
        const res = await request(buildApp(ADMIN)).get("/dms");
        expect(res.status).toBe(200);
        expect(db.getAllThreads).toHaveBeenCalled();
        expect(db.getThreadMessages).not.toHaveBeenCalled();
    });

    it("regular user gets their own thread messages", async () => {
        db.getThreadMessages.mockResolvedValue([{ id: 1, text: "hello", isFromAdmin: false, senderUsername: "user", createdAt: new Date() }]);
        const res = await request(buildApp(USER)).get("/dms");
        expect(res.status).toBe(200);
        expect(db.getThreadMessages).toHaveBeenCalledWith(USER.id);
        expect(db.getAllThreads).not.toHaveBeenCalled();
    });
});

// ─── GET /dms/:userId ────────────────────────────────────────────────────────

describe("GET /dms/:userId", () => {
    it("returns thread messages for the given user", async () => {
        db.getThreadMessages.mockResolvedValue([{ id: 1, text: "hey", isFromAdmin: true, senderUsername: "admin", createdAt: new Date() }]);
        const res = await request(buildApp(ADMIN)).get("/dms/2");
        expect(res.status).toBe(200);
        expect(db.getThreadMessages).toHaveBeenCalledWith(2);
    });
});

// ─── POST /dms ───────────────────────────────────────────────────────────────

describe("POST /dms (userSendMessage)", () => {
    it("sends message when not rate limited", async () => {
        db.getLastUserMessage.mockResolvedValue(null);
        db.createMessage.mockResolvedValue({ id: 1, text: "hello", isFromAdmin: false, senderUsername: "user", createdAt: new Date() });
        const res = await request(buildApp(USER)).post("/dms").send({ text: "hello" });
        expect(res.status).toBe(201);
        expect(db.createMessage).toHaveBeenCalledWith(expect.objectContaining({
            threadUserId: USER.id,
            senderId: USER.id,
            isFromAdmin: false,
            text: "hello",
        }));
    });

    it("returns 429 when rate limited", async () => {
        db.getLastUserMessage.mockResolvedValue({ createdAt: new Date() }); // just now
        const res = await request(buildApp(USER)).post("/dms").send({ text: "hello" });
        expect(res.status).toBe(429);
        expect(res.body.retryAfter).toBeGreaterThan(0);
        expect(db.createMessage).not.toHaveBeenCalled();
    });

    it("allows message after rate limit window has passed", async () => {
        const old = new Date(Date.now() - 61 * 1000); // 61 seconds ago
        db.getLastUserMessage.mockResolvedValue({ createdAt: old });
        db.createMessage.mockResolvedValue({ id: 2, text: "again", isFromAdmin: false, senderUsername: "user", createdAt: new Date() });
        const res = await request(buildApp(USER)).post("/dms").send({ text: "again" });
        expect(res.status).toBe(201);
    });

    it("returns 400 when text is empty", async () => {
        const res = await request(buildApp(USER)).post("/dms").send({ text: "  " });
        expect(res.status).toBe(400);
        expect(db.createMessage).not.toHaveBeenCalled();
    });

    it("returns 400 when text is missing", async () => {
        const res = await request(buildApp(USER)).post("/dms").send({});
        expect(res.status).toBe(400);
    });
});

// ─── POST /dms/:userId (admin reply) ─────────────────────────────────────────

describe("POST /dms/:userId (adminReply)", () => {
    it("admin can reply to a thread", async () => {
        db.createMessage.mockResolvedValue({ id: 3, text: "noted", isFromAdmin: true, senderUsername: "admin", createdAt: new Date() });
        const res = await request(buildApp(ADMIN)).post("/dms/2").send({ text: "noted" });
        expect(res.status).toBe(201);
        expect(db.createMessage).toHaveBeenCalledWith(expect.objectContaining({
            threadUserId: 2,
            senderId: ADMIN.id,
            isFromAdmin: true,
            text: "noted",
        }));
    });

    it("returns 400 when text is empty", async () => {
        const res = await request(buildApp(ADMIN)).post("/dms/2").send({ text: "" });
        expect(res.status).toBe(400);
        expect(db.createMessage).not.toHaveBeenCalled();
    });
});

// ─── DELETE /dms/:messageId ───────────────────────────────────────────────────

describe("DELETE /dms/:messageId", () => {
    it("deletes an existing message (204)", async () => {
        db.getMessage.mockResolvedValue({ id: 5 });
        db.deleteMessage.mockResolvedValue({});
        const res = await request(buildApp(ADMIN)).delete("/dms/5");
        expect(res.status).toBe(204);
        expect(db.deleteMessage).toHaveBeenCalledWith(5);
    });

    it("returns 404 if message not found", async () => {
        db.getMessage.mockResolvedValue(null);
        const res = await request(buildApp(ADMIN)).delete("/dms/999");
        expect(res.status).toBe(404);
        expect(db.deleteMessage).not.toHaveBeenCalled();
    });
});
