import createSectionRecord, {
    deleteSectionRecord,
    renameSectionRecord,
    updateSectionOrder,
    // getAllSectionsByGame,
    // above fn  was unused but i created a query in sectionsQueries.js for it, cant remember why. but nothing breaks so far i think
    changePageSectionRecord,
    getGameWithSectionId,
} from "../db/sectionsQueries.js";
import { canEditGame } from "../config/auth.js";

export default async function createSection(req, res) {
    const { title, gameId, order } = req.body;
    console.log(title, gameId, "is the section data");

    if (!title || !gameId) {
        return res.status(400).send({ error: "Title and gameId are required" });
    }

    if (!(await canEditGame(req.user, +gameId))) return res.sendStatus(403);

    try {
        const result = await createSectionRecord(title, gameId, order);
        res.status(201).send(result);
    } catch (error) {
        console.error("Error creating section:", error);
        res.status(500).send({ error: "Failed to create section" });
    }
}

export async function changePageSection(req, res) {
    const sectionId = req.body.sectionId;
    const pageId = +req.params.id;

    const section = sectionId ? await getGameWithSectionId(sectionId) : null;
    const gameId = section?.gameId ?? null;
    if (!(await canEditGame(req.user, gameId))) return res.sendStatus(403);

    console.log(sectionId, pageId, ": sectionId and pageId");
    const result = await changePageSectionRecord({ pageId, sectionId });
    res.send(result);
}

export async function deleteSection(req, res) {
    const sectionId = Number(req.params.id);
    console.log(sectionId, "is the ID to be deleted");

    const section = await getGameWithSectionId(sectionId);
    if (!(await canEditGame(req.user, section?.gameId ?? null))) return res.sendStatus(403);

    try {
        const result = await deleteSectionRecord(sectionId);
        res.status(201).send(result);
    } catch (e) {
        console.error("Error deleting the section record : ", e);
        res.status(500).send({ error: "failed to deleted section" });
    }
}

export async function renameSection(req, res) {
    const sectionId = Number(req.params.id);
    const title = req.body.title;

    const section = await getGameWithSectionId(sectionId);
    if (!(await canEditGame(req.user, section?.gameId ?? null))) return res.sendStatus(403);

    try {
        const result = await renameSectionRecord(sectionId, title);
        res.status(201).send(result);
    } catch (e) {
        console.error("Failed to rename section.", e);
        res.status(500).send({ error: "failed to rename section" });
    }
}

export async function reorderSection(req, res) {
    try {
        const { gameId, sectionOrder } = req.body;

        if (!Array.isArray(sectionOrder) || sectionOrder.length === 0) {
            return res.status(400).json({
                error: "sectionOrder must be a non-empty array",
            });
        }

        if (!(await canEditGame(req.user, +gameId))) return res.sendStatus(403);

        await updateSectionOrder(sectionOrder, gameId);
        res.json({ success: true });
    } catch (error) {
        console.error("Failed to reorder sections:", error);
        res.status(500).json({
            error: "Failed to reorder sections",
        });
    }
}
