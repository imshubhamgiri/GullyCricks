import { Router } from "express";
import matchRoutes from "./matchRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/matches", matchRoutes);

export default router;
