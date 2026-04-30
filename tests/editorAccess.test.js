import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// prisma mock — findUnique controlled per-test via vi.mocked(prisma.gameEditor.findUnique)
vi.mock("../lib/prisma.js", () => ({
    prisma: {
        gameEditor: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock("../db/blocksQueries.js", () => ({
    default: {
        getBlock: vi.fn(),
        updateBlock: vi.fn(),
        deleteBlock: vi.fn(),
    },
}));

vi.mock("../db/pendingQueries.js", () => ({
    default: {
        findPendingBlockByBlockIdAndOperation: vi.fn(),
        createPendingBlock: vi.fn(),
        updatePendingBlock: vi.fn(),
    },
}));

vi.mock("../db/pagesQueries.js", () => ({
    default: {
        addContributor: vi.fn(),
        createBlockForPage: vi.fn(),
        offsetBlockOrderForPage: vi.fn(),
    },
}));

vi.mock("../db/contributionQueries.js", () => ({
    default: { createContribution: vi.fn() },
}));

vi.mock("../db/sectionsQueries.js", () => ({
    default: vi.fn(),
    deleteSectionRecord: vi.fn(),
    renameSectionRecord: vi.fn(),
    updateSectionOrder: vi.fn(),
    changePageSectionRecord: vi.fn(),
    getGameWithSectionId: vi.fn(),
}));

import { prisma } from "../lib/prisma.js";
import blocksDb from "../db/blocksQueries.js";
import pendingDb from "../db/pendingQueries.js";
import pagesDb from "../db/pagesQueries.js";
import createSectionRecord, {
    deleteSectionRecord,
    renameSectionRecord,
    updateSectionOrder,
    changePageSectionRecord,
    getGameWithSectionId,
} from "../db/sectionsQueries.js";
import blocksController from "../controllers/blocksController.js";
import pagesController from "../controllers/pagesController.js";
import createSection, {
    deleteSection,
    renameSection,
    reorderSection,
    changePageSection,
} from "../controllers/sectionsController.js";

function buildApp(user) {
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => { req.user = user; next(); });

    // blocks routes
    const blocksRouter = express.Router({ mergeParams: true });
    blocksRouter.put("/:blockId", blocksController.updateBlock);
    blocksRouter.delete("/:blockId", blocksController.deleteBlock);
    app.use("/games/:gameId/blocks", blocksRouter);

    // page block routes
    const pagesRouter = express.Router({ mergeParams: true });
    pagesRouter.post("/by-id/:pageId/blocks", pagesController.createBlockForPage);
    pagesRouter.put("/by-id/:pageId/blocks", pagesController.updateBlocksForPage);
    app.use("/games/:gameId/pages", pagesRouter);

    // sections routes
    app.post("/sections", createSection);
    app.delete("/sections/:id", deleteSection);
    app.put("/sections/rename/:id", renameSection);
    app.put("/sections/reorder", reorderSection);
    app.put("/sections/:id", changePageSection);

    return app;
}

const ADMIN   = { id: 1, username: "admin",   role: "ADMIN" };
const EDITOR  = { id: 2, username: "editor",  role: "EDITOR" };
const GAME_ED = { id: 3, username: "gameditor", role: "USER" };
const USER    = { id: 4, username: "user",    role: "USER" };

const findUnique = () => vi.mocked(prisma.gameEditor.findUnique);

beforeEach(() => {
    vi.clearAllMocks();
    findUnique().mockResolvedValue(null);
});

function makeGameEditor(userId, gameId) {
    findUnique().mockImplementation(({ where }) => {
        if (where.userId_gameId.userId === userId && where.userId_gameId.gameId === gameId) {
            return Promise.resolve({ userId, gameId });
        }
        return Promise.resolve(null);
    });
}

// ─── BLOCK UPDATE ────────────────────────────────────────────────────────────

describe("PUT /games/:gameId/blocks/:blockId (updateBlock)", () => {
    beforeEach(() => {
        blocksDb.getBlock.mockResolvedValue({ id: 1, pageId: 10 });
        blocksDb.updateBlock.mockResolvedValue({ id: 1, pageId: 10 });
        pagesDb.addContributor.mockResolvedValue({});
    });

    it("admin gets direct update (200)", async () => {
        const res = await request(buildApp(ADMIN))
            .put("/games/1/blocks/1")
            .send({ content: {}, type: "text" });
        expect(res.status).toBe(200);
        expect(blocksDb.updateBlock).toHaveBeenCalled();
        expect(pendingDb.createPendingBlock).not.toHaveBeenCalled();
    });

    it("global editor gets direct update (200)", async () => {
        const res = await request(buildApp(EDITOR))
            .put("/games/1/blocks/1")
            .send({ content: {}, type: "text" });
        expect(res.status).toBe(200);
        expect(blocksDb.updateBlock).toHaveBeenCalled();
    });

    it("per-game editor gets direct update (200)", async () => {
        makeGameEditor(GAME_ED.id, 1);
        const res = await request(buildApp(GAME_ED))
            .put("/games/1/blocks/1")
            .send({ content: {}, type: "text" });
        expect(res.status).toBe(200);
        expect(blocksDb.updateBlock).toHaveBeenCalled();
        expect(pendingDb.createPendingBlock).not.toHaveBeenCalled();
    });

    it("per-game editor for WRONG game goes to pending (202)", async () => {
        makeGameEditor(GAME_ED.id, 99); // editor for game 99, not game 1
        pendingDb.findPendingBlockByBlockIdAndOperation.mockResolvedValue(null);
        const res = await request(buildApp(GAME_ED))
            .put("/games/1/blocks/1")
            .send({ content: {}, type: "text" });
        expect(res.status).toBe(202);
        expect(pendingDb.createPendingBlock).toHaveBeenCalled();
    });

    it("regular user goes to pending (202)", async () => {
        pendingDb.findPendingBlockByBlockIdAndOperation.mockResolvedValue(null);
        const res = await request(buildApp(USER))
            .put("/games/1/blocks/1")
            .send({ content: {}, type: "text" });
        expect(res.status).toBe(202);
        expect(blocksDb.updateBlock).not.toHaveBeenCalled();
        expect(pendingDb.createPendingBlock).toHaveBeenCalled();
    });
});

// ─── BLOCK DELETE ────────────────────────────────────────────────────────────

describe("DELETE /games/:gameId/blocks/:blockId (deleteBlock)", () => {
    beforeEach(() => {
        blocksDb.getBlock.mockResolvedValue({ id: 1 });
        blocksDb.deleteBlock.mockResolvedValue({ id: 1 });
    });

    it("admin deletes directly (200)", async () => {
        const res = await request(buildApp(ADMIN)).delete("/games/1/blocks/1");
        expect(res.status).toBe(200);
        expect(blocksDb.deleteBlock).toHaveBeenCalled();
    });

    it("global editor deletes directly (200)", async () => {
        const res = await request(buildApp(EDITOR)).delete("/games/1/blocks/1");
        expect(res.status).toBe(200);
    });

    it("per-game editor deletes directly (200)", async () => {
        makeGameEditor(GAME_ED.id, 1);
        const res = await request(buildApp(GAME_ED)).delete("/games/1/blocks/1");
        expect(res.status).toBe(200);
        expect(blocksDb.deleteBlock).toHaveBeenCalled();
    });

    it("per-game editor for wrong game goes to pending (202)", async () => {
        makeGameEditor(GAME_ED.id, 99);
        pendingDb.findPendingBlockByBlockIdAndOperation.mockResolvedValue(null);
        const res = await request(buildApp(GAME_ED)).delete("/games/1/blocks/1");
        expect(res.status).toBe(202);
    });

    it("regular user goes to pending (202)", async () => {
        pendingDb.findPendingBlockByBlockIdAndOperation.mockResolvedValue(null);
        const res = await request(buildApp(USER)).delete("/games/1/blocks/1");
        expect(res.status).toBe(202);
        expect(blocksDb.deleteBlock).not.toHaveBeenCalled();
    });

    it("returns 404 if block not found", async () => {
        blocksDb.getBlock.mockResolvedValue(null);
        const res = await request(buildApp(ADMIN)).delete("/games/1/blocks/999");
        expect(res.status).toBe(404);
    });
});

// ─── PAGE BLOCKS ─────────────────────────────────────────────────────────────

describe("POST /games/:gameId/pages/by-id/:pageId/blocks (createBlockForPage)", () => {
    beforeEach(() => {
        pagesDb.createBlockForPage.mockResolvedValue({ id: 5, pageId: 10 });
    });

    it("admin creates directly", async () => {
        const res = await request(buildApp(ADMIN))
            .post("/games/1/pages/by-id/10/blocks")
            .send({ order: 0, type: "text" });
        expect(res.status).toBe(200);
        expect(pagesDb.createBlockForPage).toHaveBeenCalled();
    });

    it("global editor creates directly", async () => {
        const res = await request(buildApp(EDITOR))
            .post("/games/1/pages/by-id/10/blocks")
            .send({ order: 0, type: "text" });
        expect(res.status).toBe(200);
    });

    it("per-game editor creates directly", async () => {
        makeGameEditor(GAME_ED.id, 1);
        const res = await request(buildApp(GAME_ED))
            .post("/games/1/pages/by-id/10/blocks")
            .send({ order: 0, type: "text" });
        expect(res.status).toBe(200);
        expect(pagesDb.createBlockForPage).toHaveBeenCalled();
    });

    it("per-game editor for wrong game goes to pending (202)", async () => {
        makeGameEditor(GAME_ED.id, 99);
        pendingDb.createPendingBlock.mockResolvedValue({});
        const res = await request(buildApp(GAME_ED))
            .post("/games/1/pages/by-id/10/blocks")
            .send({ order: 0, type: "text" });
        expect(res.status).toBe(202);
        expect(pagesDb.createBlockForPage).not.toHaveBeenCalled();
    });

    it("regular user goes to pending (202)", async () => {
        pendingDb.createPendingBlock.mockResolvedValue({});
        const res = await request(buildApp(USER))
            .post("/games/1/pages/by-id/10/blocks")
            .send({ order: 0, type: "text" });
        expect(res.status).toBe(202);
    });
});

// ─── SECTIONS ────────────────────────────────────────────────────────────────

describe("Sections — access control", () => {
    beforeEach(() => {
        createSectionRecord.mockResolvedValue({ id: 1 });
        deleteSectionRecord.mockResolvedValue({ id: 1 });
        renameSectionRecord.mockResolvedValue({ id: 1 });
        updateSectionOrder.mockResolvedValue({});
        changePageSectionRecord.mockResolvedValue({ id: 1 });
        getGameWithSectionId.mockResolvedValue({ gameId: 1 });
    });

    it("admin can create section", async () => {
        const res = await request(buildApp(ADMIN))
            .post("/sections")
            .send({ title: "New", gameId: 1 });
        expect(res.status).toBe(201);
    });

    it("global editor can create section", async () => {
        const res = await request(buildApp(EDITOR))
            .post("/sections")
            .send({ title: "New", gameId: 1 });
        expect(res.status).toBe(201);
    });

    it("per-game editor can create section for their game", async () => {
        makeGameEditor(GAME_ED.id, 1);
        const res = await request(buildApp(GAME_ED))
            .post("/sections")
            .send({ title: "New", gameId: 1 });
        expect(res.status).toBe(201);
    });

    it("per-game editor blocked from another game's section", async () => {
        makeGameEditor(GAME_ED.id, 99);
        const res = await request(buildApp(GAME_ED))
            .post("/sections")
            .send({ title: "New", gameId: 1 });
        expect(res.status).toBe(403);
    });

    it("regular user blocked from creating section (403)", async () => {
        const res = await request(buildApp(USER))
            .post("/sections")
            .send({ title: "New", gameId: 1 });
        expect(res.status).toBe(403);
    });

    it("admin can delete section", async () => {
        const res = await request(buildApp(ADMIN)).delete("/sections/1");
        expect(res.status).toBe(201);
    });

    it("per-game editor can delete section for their game", async () => {
        makeGameEditor(GAME_ED.id, 1);
        const res = await request(buildApp(GAME_ED)).delete("/sections/1");
        expect(res.status).toBe(201);
    });

    it("regular user blocked from deleting section (403)", async () => {
        const res = await request(buildApp(USER)).delete("/sections/1");
        expect(res.status).toBe(403);
    });

    it("admin can rename section", async () => {
        const res = await request(buildApp(ADMIN))
            .put("/sections/rename/1")
            .send({ title: "Renamed" });
        expect(res.status).toBe(201);
    });

    it("per-game editor can rename section for their game", async () => {
        makeGameEditor(GAME_ED.id, 1);
        const res = await request(buildApp(GAME_ED))
            .put("/sections/rename/1")
            .send({ title: "Renamed" });
        expect(res.status).toBe(201);
    });

    it("regular user blocked from renaming section (403)", async () => {
        const res = await request(buildApp(USER))
            .put("/sections/rename/1")
            .send({ title: "Renamed" });
        expect(res.status).toBe(403);
    });

    it("admin can reorder sections", async () => {
        const res = await request(buildApp(ADMIN))
            .put("/sections/reorder")
            .send({ gameId: 1, sectionOrder: [{ id: 1, order: 0 }] });
        expect(res.status).toBe(200);
    });

    it("per-game editor can reorder sections for their game", async () => {
        makeGameEditor(GAME_ED.id, 1);
        const res = await request(buildApp(GAME_ED))
            .put("/sections/reorder")
            .send({ gameId: 1, sectionOrder: [{ id: 1, order: 0 }] });
        expect(res.status).toBe(200);
    });

    it("regular user blocked from reordering (403)", async () => {
        const res = await request(buildApp(USER))
            .put("/sections/reorder")
            .send({ gameId: 1, sectionOrder: [{ id: 1, order: 0 }] });
        expect(res.status).toBe(403);
    });
});
