import { prisma } from "../lib/prisma.js";

// ── Categories ────────────────────────────────────────────────────────────────

async function getTierCategories(gameId) {
    return await prisma.tierCategory.findMany({
        where: { gameId },
        orderBy: { order: "asc" },
    });
}

async function getTierCategoryFull(id) {
    return await prisma.tierCategory.findUnique({
        where: { id },
        include: {
            items: { orderBy: { order: "asc" } },
            modes: {
                orderBy: { order: "asc" },
                include: {
                    sections: { orderBy: { order: "asc" } },
                    tiers: {
                        orderBy: { order: "asc" },
                        include: {
                            entries: {
                                orderBy: { order: "asc" },
                                select: { id: true, itemId: true, sectionId: true, order: true },
                            },
                        },
                    },
                },
            },
        },
    });
}

async function createTierCategory({ gameId, name, order }) {
    return await prisma.tierCategory.create({ data: { gameId, name, order } });
}

async function deleteTierCategory(id) {
    return await prisma.tierCategory.delete({ where: { id } });
}

// ── Items ─────────────────────────────────────────────────────────────────────

async function createTierItem({ categoryId, name, imageUrl, order }) {
    return await prisma.tierItem.create({ data: { categoryId, name, imageUrl, order } });
}

async function deleteTierItem(id) {
    return await prisma.tierItem.delete({ where: { id } });
}

// ── Modes ─────────────────────────────────────────────────────────────────────

async function createTierMode({ categoryId, name, color, order }) {
    return await prisma.tierMode.create({ data: { categoryId, name, color, order } });
}

async function deleteTierMode(id) {
    return await prisma.tierMode.delete({ where: { id } });
}

// ── Tiers ─────────────────────────────────────────────────────────────────────

async function createTierTier({ modeId, name, color, order }) {
    return await prisma.tierTier.create({ data: { modeId, name, color, order } });
}

async function updateTierTier({ id, order, name, color }) {
    return await prisma.tierTier.update({
        where: { id },
        data: {
            ...(order !== undefined && { order }),
            ...(name !== undefined && { name }),
            ...(color !== undefined && { color }),
        },
    });
}

async function deleteTierTier(id) {
    return await prisma.tierTier.delete({ where: { id } });
}

// ── Entries ───────────────────────────────────────────────────────────────────

async function getTierEntriesInMode({ modeId, itemId }) {
    return await prisma.tierEntry.findFirst({ where: { modeId, itemId } });
}

async function countTierEntriesInTier(tierId) {
    return await prisma.tierEntry.count({ where: { tierId } });
}

async function createTierEntry({ modeId, tierId, itemId, sectionId }) {
    const order = await countTierEntriesInTier(tierId);
    return await prisma.tierEntry.create({ data: { modeId, tierId, itemId, order, sectionId: sectionId ?? null } });
}

// ── Sections ──────────────────────────────────────────────────────────────────

async function createTierSection({ modeId, name, order }) {
    return await prisma.tierSection.create({ data: { modeId, name, order } });
}

async function deleteTierSection(id) {
    return await prisma.tierSection.delete({ where: { id } });
}

async function deleteTierEntry(id) {
    return await prisma.tierEntry.delete({ where: { id } });
}

export default {
    getTierCategories,
    getTierCategoryFull,
    getTierEntriesInMode,
    createTierCategory,
    deleteTierCategory,
    createTierItem,
    deleteTierItem,
    createTierMode,
    deleteTierMode,
    createTierTier,
    updateTierTier,
    deleteTierTier,
    createTierEntry,
    deleteTierEntry,
    createTierSection,
    deleteTierSection,
};
