import { check } from "express-validator";
import { prisma } from "../lib/prisma.js";
import e from "express";

async function getPages() {
    return await prisma.page.findMany();
}

async function createPage(title) {
    return await prisma.page.create({
        data: { title },
    });
}

async function checkPagesForTitle(title) {
    const result = await prisma.page.findFirst({
        where: {
            title,
        },
    });

    return result !== null;
}

async function checkPageById(id) {
    const result = await prisma.page.findUnique({
        where: { id },
    });

    return result !== null;
}

async function deletePageById(id) {
    return await prisma.page.delete({
        where: {
            id,
        },
    });
}

export default {
    getPages,
    createPage,
    checkPagesForTitle,
    deletePageById,
    checkPageById,
};
