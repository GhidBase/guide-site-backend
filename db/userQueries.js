import { prisma } from "../lib/prisma.js";

async function findByGoogleId(googleId) {
    return prisma.user.findUnique({ where: { googleId } });
}

async function findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
}

async function linkGoogleId(id, googleId, avatarUrl) {
    return prisma.user.update({
        where: { id },
        data: { googleId, ...(avatarUrl && !await prisma.user.findUnique({ where: { id }, select: { avatarUrl: true } }).then(u => u.avatarUrl) && { avatarUrl }) },
    });
}

async function createGoogleUser({ googleId, email, username, avatarUrl }) {
    // If username is taken, append part of googleId
    const base = username;
    let finalUsername = base;
    const existing = await prisma.user.findUnique({ where: { username: base } });
    if (existing) {
        finalUsername = `${base}_${googleId.slice(0, 6)}`;
    }
    return prisma.user.create({
        data: { googleId, email, username: finalUsername, avatarUrl, role: "USER" },
    });
}

async function updateAvatarUrl(id, avatarUrl) {
    return prisma.user.update({ where: { id }, data: { avatarUrl } });
}

async function updateOrbSettings(id, orbSettings) {
    const user = await prisma.user.findUnique({ where: { id }, select: { orbSettings: true } });
    const merged = { ...(user.orbSettings || {}), ...orbSettings };
    return prisma.user.update({ where: { id }, data: { orbSettings: merged } });
}

export default { findByGoogleId, findByEmail, linkGoogleId, createGoogleUser, updateAvatarUrl, updateOrbSettings };
