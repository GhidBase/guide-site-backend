import { prisma } from "../lib/prisma.js";

async function getPages() {
    return await prisma.page.findMany();
}

async function createPage(title) {
    return await prisma.page.create({
        data: { title },
    });
}

export default { getPages, createPage };
