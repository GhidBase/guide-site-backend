import { prisma } from "../lib/prisma.js";

async function getPresets() {
    return prisma.preset.findMany();
}

async function createPreset({ name, light, dark, animations, createdBy }) {
    return prisma.preset.create({
        data: { name, light, dark, animations, createdBy },
    });
}

async function updatePreset(id, data) {
    return prisma.preset.update({
        where: { id },
        data,
    });
}

async function deletePreset(id) {
    return prisma.preset.delete({ where: { id } });
}

export default { getPresets, createPreset, updatePreset, deletePreset };
