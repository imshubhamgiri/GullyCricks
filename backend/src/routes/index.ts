import { Router } from "express";
import matchRoutes from "./matchRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.use("/V1/users", userRoutes);
router.use("/V1/matches", matchRoutes);

export default router;
