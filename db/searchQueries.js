import { prisma } from "../lib/prisma.js";

export async function searchPages(query, gameId) {
    const term = `%${query}%`;
    const gameIdInt = gameId ? parseInt(gameId) : null;

    return await prisma.$queryRaw`
        SELECT DISTINCT ON (p.id)
            p.id,
            p.title,
            p.slug,
            s.title AS "sectionTitle"
        FROM "Page" p
        LEFT JOIN "Section" s ON p."sectionId" = s.id
        LEFT JOIN "Block" b ON b."pageId" = p.id
        WHERE (${gameIdInt}::int IS NULL OR p."gameId" = ${gameIdInt}::int)
            AND (
                p.title ILIKE ${term}
                OR p.description ILIKE ${term}
                OR b.content::text ILIKE ${term}
            )
        ORDER BY p.id
        LIMIT 10
    `;
}
