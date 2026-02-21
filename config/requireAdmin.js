export default function requireAdmin(req, res, next) {
    const secret = req.headers["x-admin-secret"];
    console.log("secret:");
    console.log(secret);
    if (!secret || secret !== process.env.ADMIN_SECRET) {
        return res.sendStatus(403);
    }

    next();
}