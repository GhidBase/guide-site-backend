import { prisma } from "../lib/prisma.js";
import { check } from "express-validator";

async function addUser(username, password, role) {
    const exists = await prisma.user.findFirst({
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
    const result = await prisma.user.findMany({
        where: { username: username },
    });
    return result.length > 0;
}

async function getUserById(id) {
    const result = await prisma.user.findUnique({
        where: {
            id: id,
        },
    });
    return result;
}

export default {
    addUser,
    getUser,
    getUserById,
    checkUserExists,
};
