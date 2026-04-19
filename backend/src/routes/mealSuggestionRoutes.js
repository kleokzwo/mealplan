import express from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import {
  getActiveWeekMealSuggestions,
  patchWeekMealSuggestionStatus,
} from "../controllers/mealSuggestionController.js";

const router = express.Router();

router.get("/active-week", requireAuth, getActiveWeekMealSuggestions);
router.patch("/:id/status", requireAuth, patchWeekMealSuggestionStatus);

export default router;