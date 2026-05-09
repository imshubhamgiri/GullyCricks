import { Router } from "express";
import { createMatch, getMatches } from "../controllers/matchController.js";

const router = Router();

router.get("/", getMatches);
router.post("/", createMatch);

export default router;
