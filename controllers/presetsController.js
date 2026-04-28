import db from "../db/presetQueries.js";

async function getPresets(req, res) {
    const presets = await db.getPresets();
    res.json(presets);
}

async function createPreset(req, res) {
    const { name, light, dark, animations } = req.body;
    const preset = await db.createPreset({
        name,
        light,
        dark,
        animations,
        createdBy: req.user.id,
    });
    res.status(201).json(preset);
}

async function updatePreset(req, res) {
    const id = +req.params.id;
    const { name, light, dark, animations } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (light !== undefined) data.light = light;
    if (dark !== undefined) data.dark = dark;
    if (animations !== undefined) data.animations = animations;
    const preset = await db.updatePreset(id, data);
    res.json(preset);
}

async function deletePreset(req, res) {
    const id = +req.params.id;
    await db.deletePreset(id);
    res.sendStatus(204);
}

export default { getPresets, createPreset, updatePreset, deletePreset };
