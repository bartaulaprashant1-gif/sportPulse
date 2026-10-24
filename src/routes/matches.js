import {Router} from "express";
import {createMatchSchema} from "../validation/matches.js";
import {getMatchStatus} from "../utils/match-status.js";
import {db} from "../db/db.js";

export const matchRouter = Router();


matchRouter.get('/', (req, res)=>{
    res.status(200).json({message:"matches list"})
})
matchRouter.post('/', async (req, res)=>{
    const parsed=createMatchSchema.safeParse(req.body)
    const {data:{startTime, endTime, homeScore, awayScore}}=parsed;

    if(!parsed.success){
        res.status(400).json({error:'invalid payload', details:JSON.stringify(parsed.error)})
        return
    }

    try{
        const [event]=await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore:homeScore ?? 0,
            awayScore:awayScore ?? 0,
            status:getMatchStatus(startTime, endTime),
        }).returning();

        res.status(201).json({data:event})
    }catch(e){
        res.status(500).json({error:'failed to create a match', details:JSON.stringify(e)})
    }
})
