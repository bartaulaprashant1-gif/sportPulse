import { Router } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";
import {getMatchStatus} from "../validation/matchStatus.js"
import { matches } from "../db/schema.js";
import { db } from "../db/db.js";
import { desc } from "drizzle-orm";

export const matchRouter = Router();

const MAX_LIMIT = 100;
matchRouter.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid query.", details: JSON.stringify(parsed.error) });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const matchList = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);

    res.json({ data: matchList });
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: "Failed to list matches." });
  }
});
matchRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);
  const {
    data: { startTime, endTime, homeScore, awayScore },
  } = parsed;

  if (!parsed.success) {
    res
      .status(400)
      .json({
        error: "invalid payload",
        details: JSON.stringify(parsed.error),
      });
    return;
  }

  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime),
      })
      .returning();

    res.status(201).json({ data: event });
  } catch (e) {
    console.log(e.message);
    res
      .status(500)
      .json({ error: "failed to create a match", details: JSON.stringify(e) });
  }
});
