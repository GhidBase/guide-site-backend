import { prisma } from "../lib/prisma.js";

async function addUser(username, password, role) {
    const exists = await prisma.user.findUnique({
        where: {
            username: username,
        },
    });
    if (exists) return;
    const result = await prisma.user.create({
        data: {
            password: password,
            username: username,
            role: role,
        },
    });
    return result;
}

async function getUser(username) {
    const result = await prisma.user.findUnique({
        where: {
            username: username,
        },
    });
    return result;
}

async function checkUserExists(username) {
    const result = await prisma.user.findUnique({
        where: { username: username },
    });
    return result !== null;
}

async function getUserById(id) {
    const result = await prisma.user.findUnique({
        where: {
            id: id,
        },
    });
    return result;
}

async function updateUserRole(id, newRole) {
    return await prisma.user.update({
        where: {
            id: id,
        },
        data: {
            role: newRole,
        },
    });
}

async function getAllUsers() {
    const result = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            role: true,
        },
    });
    return result;
}

export default {
    addUser,
    getUser,
    getUserById,
    checkUserExists,
    updateUserRole,
    getAllUsers,
};
