import createSectionRecord, { deleteSectionRecord, renameSectionRecord, updateSectionOrder, getAllSectionsByGame } from "../db/sectionsQueries.js"

export default async function createSection(req, res){
    const {title, gameId, order} = req.body;
    console.log(title, gameId, "is the section data");
    
    if (!title || !gameId) {
        return res.status(400).send({ error: "Title and gameId are required" });
    }

    try {
        const result = await createSectionRecord(title, gameId, order);
        res.status(201).send(result);
    } catch (error) {
        console.error("Error creating section:", error);
        res.status(500).send({ error: "Failed to create section" });
    }
}

export async function changePageSection(req,res){
    const sectionId = req.body.sectionId;
    const pageId = req.params.pageId;

    console.log(sectionId, pageId, ": sectionId and pageId");
    
}

export async function deleteSection(req,res){
    const sectionId = Number(req.params.id);
    console.log(sectionId, 'is the ID to be deleted');
    try {
        const result = await deleteSectionRecord(sectionId);
        res.status(201).send(result);
    }
    catch(e){
        console.error("Error deleting the section record : ", e);
        res.status(500).send({error : "failed to deleted section"})
    }
}

export async function renameSection(req,res){

    const sectionId = Number(req.params.id);
    const title = req.body.title;
    try{
        const result = await renameSectionRecord(sectionId, title);
        res.status(201).send(result);
    }

    catch(e){
        console.error('Failed to rename section.',e);
        res.status(500).send({error : "failed to rename section"});
    }
}


export async function reorderSection(req, res) {
    try {
        const { gameId, sectionOrder } = req.body;

        if (!Array.isArray(sectionOrder) || sectionOrder.length === 0) {
            return res.status(400).json({ 
                error: 'sectionOrder must be a non-empty array' 
            });
        }

        await updateSectionOrder(sectionOrder, gameId);

        res.json({ success: true });
    } catch (error) {
        console.error('Failed to reorder sections:', error);
        res.status(500).json({ 
            error: 'Failed to reorder sections' 
        });
    }
}

export async function getNavbar(req, res) {
    try {
        const gameId = req.query.gameId ? parseInt(req.query.gameId) : null;
        
        const games = await prisma.game.findMany({
            where: gameId ? { id: gameId } : {},
            include: {
                sections: {
                    include: { pages: true },
                    orderBy: { order: 'asc' }
                }
            }
        });
        
        res.json(games);
    } catch (error) {
        console.error('Failed to fetch navbar:', error);
        res.status(500).json({ error: 'Failed to fetch navbar' });
    }
}