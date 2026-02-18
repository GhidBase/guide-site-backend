export function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
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

