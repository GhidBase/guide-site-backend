import { prisma } from "../lib/prisma.js";

async function getLeads(req, res) {
    const leads = await prisma.fmLead.findMany({
        orderBy: { createdAt: "desc" },
    });
    res.json(leads);
}

// Called by FileMaker on record commit — marks synced: true
async function upsertLead(req, res) {
    const { primaryKey, name, email, company, message, creationTimestamp } = req.body;

    if (!primaryKey || !name || !email) {
        return res.status(400).json({ error: "primaryKey, name, and email are required" });
    }

    const lead = await prisma.fmLead.upsert({
        where: { id: primaryKey },
        update: { name, email, company, message, synced: true },
        create: { id: primaryKey, name, email, company, message, synced: true },
    });

    console.log(`FM upsert lead: ${name} <${email}> (${primaryKey})`);
    res.json({ ok: true, lead });
}

// Called by web UI — creates lead with synced: false for FileMaker to pick up
async function createFromWeb(req, res) {
    const { id, name, email, company, message } = req.body;

    if (!id || !name || !email) {
        return res.status(400).json({ error: "id, name, and email are required" });
    }

    const lead = await prisma.fmLead.create({
        data: { id, name, email, company, message, synced: false },
    });

    console.log(`Web lead: ${name} <${email}> (${id})`);
    res.json({ ok: true, lead });
}

// Polled by FileMaker timer script
async function getPending(req, res) {
    const pending = await prisma.fmLead.findMany({
        where: { synced: false },
    });
    res.json(pending);
}

async function deleteLead(req, res) {
    const { primaryKey } = req.params;

    const existing = await prisma.fmLead.findUnique({ where: { id: primaryKey } });
    if (!existing) {
        return res.status(404).json({ error: "Lead not found" });
    }

    await prisma.fmLead.delete({ where: { id: primaryKey } });
    console.log(`FM delete lead: ${primaryKey}`);
    res.json({ ok: true });
}

async function deleteAllLeads(req, res) {
    const { count } = await prisma.fmLead.deleteMany();
    console.log(`Deleted all leads (${count})`);
    res.json({ ok: true, deleted: count });
}

export default { getLeads, upsertLead, createFromWeb, getPending, deleteLead, deleteAllLeads };
