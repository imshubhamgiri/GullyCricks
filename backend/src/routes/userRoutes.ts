import { Router } from "express";
import { createUser, getUsers } from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers);
router.post("/", createUser);

export default router;
