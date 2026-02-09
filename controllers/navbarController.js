import { updateNavbarData } from "../db/navbarQueries.js";
import { getMapData } from "../db/navbarQueries.js";

export async function getNavbarData(req,res){
    console.log("yo");
    try{
        if (!Array.isArray(req.body)){
            return res.status(400).json({error:"Invalid navbar data"});
        }

        const navbar = req.body;
        await updateNavbarData(navbar);
        res.status(200).json({success : true});
    }

    catch(err){
        res.status(500).json({error:"failed to store navbar"});
    }
}

export async function getMapDataFromDB(req,res){
    console.log("fetching data...\n");
    const result = await getMapData();
    res.status(200).json(result);

}