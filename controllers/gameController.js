import { check } from "express-validator";
import db from "../db/gameQueries.js";

async function getGames(req, res) {
    const games = await db.getGames();
    res.send(games);
}

async function postGame(req, res) {
    if (req.body.title == undefined) {
        res.status(400).send("Bad Request: Title value is undefined");
        return;
    }

    const game = await db.createGame(req.body.title);
    res.status(200).send(game);
}

async function getChecklists(req, res) {
    const gameId = +req.params.gameId;
    const checklists = await db.getChecklists(gameId);
    res.send(checklists);
}

async function postChecklist(req, res) {
    if (req.body.title == undefined) {
        res.status(400).send("Bad Request: Title value is undefined");
        return;
    }
    const gameId = +req.params.gameId;
    const title = req.body.title;
    console.log(gameId);
    console.log(req.body.title);
    const checklist = await db.createChecklist(title, gameId);
    res.status(200).send(checklist);
}

async function getChecklistItems(req, res) {
    const checklistId = +req.params.checklistId;
    const checklistItems = await db.getChecklistItems(checklistId);
    console.log(checklistItems);
    res.status(200).send(checklistItems);
}

export default {
    getGames,
    postGame,
    postChecklist,
    getChecklists,
    getChecklistItems,
};
