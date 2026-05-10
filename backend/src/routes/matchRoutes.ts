import { Router } from "express";
import { createMatch, getMatches, updateScore } from "../controllers/matchController.js";

const router = Router();

router.get("/", getMatches);
router.post("/", createMatch);
router.post("/join", createMatch); // Placeholder for join match functionality
router.post("/:matchId/score" , updateScore);

export default router;
