export default function requireAdmin(req, res, next) {
    if (req.user && req.user.role === "ADMIN") {
        next();
    } else {
        res.sendStatus(403);
    }
}
