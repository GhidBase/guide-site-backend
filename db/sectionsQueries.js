import { prisma } from "../lib/prisma.js"

export default async function createSectionRecord(title, gameId){

    return await prisma.section.create({
        data:{
            title,
            gameId
        }
    })
}

export async function getGameWithSectionId(sectionId){
    return await prisma.section.findUnique({
        where:{
            id : sectionId
        },
        select:{
            gameId : true
        }
    })
}


export async function deleteSectionRecord(id){
    return await prisma.section.delete({
        where:{
            id
        }
    })
}

export async function renameSectionRecord(id, title){
    return await prisma.section.update({
        where:{
            id
        },
        data:{
            title
        }
    })
}

export async function updateSectionOrder(sectionOrder, gameId) {
    await prisma.$transaction(
        sectionOrder.map((sectionId, index) =>
            prisma.section.update({
                where: { 
                    id: sectionId,
                    gameId: gameId 
                },
                data: { order: index }
            })
        )
    );
}

export async function getAllSectionsByGame(gameId) {
    return await prisma.section.findMany({
        where: { gameId },
        include: { pages: true },
        orderBy: { order: 'asc' }
    });
}