import express from "express";
import { runDailySummary } from "../controllers/dailySummaryController.js";

const router = express.Router();

router.post("/run", runDailySummary);

export default router;