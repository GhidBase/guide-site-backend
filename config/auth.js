import { prisma } from "../lib/prisma.js";

export async function isEditorForGame(userId, gameId) {
    if (!gameId) return false;
    const entry = await prisma.gameEditor.findUnique({
        where: { userId_gameId: { userId, gameId } },
    });
    return !!entry;
}

export function canEditGame(user, gameId) {
    if (!user) return Promise.resolve(false);
    if (user.role === "ADMIN" || user.role === "EDITOR") return Promise.resolve(true);
    return isEditorForGame(user.id, gameId);
}

export function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        console.log("not authenticated")
        res.status(403).json({ message: "Not authenticated" });
    }
}

export function requireEditor(req, res, next) {
    if (req.user && (req.user.role === "EDITOR" || req.user.role === "ADMIN")) {
        next();
    } else {
        res.sendStatus(403);
    }
}

export function requireAdmin(req, res, next) {
    if (req.user && req.user.role === "ADMIN") {
        next();
    } else {
        res.sendStatus(403);
    }
}

