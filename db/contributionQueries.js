import { prisma } from "../lib/prisma.js";

async function createContribution({ userId, pageId, gameId }) {
    return await prisma.contribution.create({
        data: { userId, pageId, gameId },
    });
}

async function getLeaderboard(gameId) {
    return await prisma.$queryRaw`
        SELECT u.id, u.username, COUNT(c.id)::int AS contributions
        FROM "Contribution" c
        JOIN "User" u ON u.id = c."userId"
        WHERE c."gameId" = ${gameId}
        GROUP BY u.id, u.username
        ORDER BY contributions DESC
        LIMIT 20
    `;
}

async function getGlobalLeaderboard() {
    return await prisma.$queryRaw`
        SELECT
            u.id,
            u.username,
            SUM(gc.contributions)::int AS contributions,
            json_agg(
                json_build_object(
                    'gameId', gc."gameId",
                    'title', g.title,
                    'contributions', gc.contributions
                )
                ORDER BY gc.contributions DESC
            ) AS "byGame"
        FROM (
            SELECT "userId", "gameId", COUNT(id)::int AS contributions
            FROM "Contribution"
            GROUP BY "userId", "gameId"
        ) gc
        JOIN "User" u ON u.id = gc."userId"
        JOIN "Game" g ON g.id = gc."gameId"
        GROUP BY u.id, u.username
        ORDER BY contributions DESC
        LIMIT 20
    `;
}

export default { createContribution, getLeaderboard, getGlobalLeaderboard };
