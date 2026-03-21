import { prisma } from "../lib/prisma.js";

async function getPageImages(pageId) {
    return await prisma.pageImage.findMany({
        where: { pageId },
        orderBy: { createdAt: "desc" },
    });
}

async function createPageImage({ title, filename, url, pageId, category }) {
    return await prisma.pageImage.create({
        data: { title, filename, url, pageId, category },
    });
}

async function getPageImage(id) {
    return await prisma.pageImage.findUnique({ where: { id } });
}

async function deletePageImage(id) {
    return await prisma.pageImage.delete({ where: { id } });
}

export default { getPageImages, createPageImage, getPageImage, deletePageImage };
