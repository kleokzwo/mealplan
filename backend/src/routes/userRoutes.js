// backend/routes/userRoutes.js
import express from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import {
  getMe,
  updateSettings,
  updateOnboarding,
  updateHouseholdSettings,
} from "../controllers/userController.js";

const router = express.Router();

router.use(requireAuth);

router.get("/me", getMe);
router.patch("/me/settings", updateSettings);
router.patch("/me/onboarding", updateOnboarding);
router.patch("/me/household", updateHouseholdSettings);

export default router;