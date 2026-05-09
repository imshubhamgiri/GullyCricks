import { Request, Response } from "express";
import * as userService from "../services/userService.js";

export async function createUser(req: Request, res: Response): Promise<Response> {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user";
    return res.status(400).json({ message });
  }
}

export async function getUsers(_req: Request, res: Response): Promise<Response> {
  try {
    const users = await userService.getUsers();
    return res.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return res.status(500).json({ message });
  }
}
