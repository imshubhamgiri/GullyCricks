import { Request, Response } from "express";
import * as matchService from "../services/matchService.js";

export async function createMatch(req: Request, res: Response): Promise<Response> {
  try {
    const match = await matchService.createMatch(req.body);
    return res.status(201).json(match);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create match";
    return res.status(400).json({ message });
  }
}

export async function getMatches(_req: Request, res: Response): Promise<Response> {
  try {
    const matches = await matchService.getMatches();
    return res.json(matches);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch matches";
    return res.status(500).json({ message });
  }
}
