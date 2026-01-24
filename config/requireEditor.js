export default function requireEditor(req, res, next) {
    if (req.user && (req.user.role === "EDITOR" || req.user.role === "ADMIN")) {
        next();
    } else {
        res.sendStatus(403);
    }
}
