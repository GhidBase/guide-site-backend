import { prisma } from "../lib/prisma.js";

async function getUnitCategories(gameId) {
    return await prisma.unitCategory.findMany({
        where: { gameId },
        include: { units: true },
        orderBy: { order: "asc" },
    });
}

async function createUnitCategory({ name, gameId }) {
    return await prisma.unitCategory.create({
        data: { name, gameId },
    });
}

async function deleteUnitCategory(id) {
    return await prisma.unitCategory.delete({ where: { id } });
}

async function createUnit({ name, imageUrl, categoryId, gameId }) {
    return await prisma.unit.create({
        data: { name, imageUrl, categoryId, gameId },
    });
}

async function deleteUnit(id) {
    return await prisma.unit.delete({ where: { id } });
}

export default {
    getUnitCategories,
    createUnitCategory,
    deleteUnitCategory,
    createUnit,
    deleteUnit,
};
