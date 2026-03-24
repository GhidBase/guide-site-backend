import db from "../db/userQueries.js";

async function getMe(req, res) {
    const { id, username, email, avatarUrl, orbSettings } = req.user;
    res.json({ id, username, email, avatarUrl, orbSettings });
}

async function updateMe(req, res) {
    const { orbSettings } = req.body;
    if (!orbSettings) return res.status(400).json({ message: "Nothing to update" });
    const updated = await db.updateOrbSettings(req.user.id, orbSettings);
    const { id, username, email, avatarUrl, orbSettings: orb } = updated;
    res.json({ id, username, email, avatarUrl, orbSettings: orb });
}

async function uploadAvatar(req, res) {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const avatarUrl = req.file.location;
    await db.updateAvatarUrl(req.user.id, avatarUrl);
    res.json({ avatarUrl });
}

export default { getMe, updateMe, uploadAvatar };
