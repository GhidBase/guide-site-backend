import { prisma } from "../lib/prisma.js";

export async function getGames() {
    return await prisma.game.findMany();
}

export async function updateNavbarData(navbarData){

    const result = await prisma.game.update({
        where:{
            id: 1 // temporary for LDG
        },
        data:{
            navbar : navbarData
        }
    })
}

export async function getMapData(){
    return await prisma.game.findMany({
        include:{
            sections : {
                include:{
                    pages : true
                }
            }
        }
    })
}