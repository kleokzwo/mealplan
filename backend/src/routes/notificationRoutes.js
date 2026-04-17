// backend/routes/notificationRoutes.js
import express from "express";
import {
  triggerWeekMail,
  triggerShoppingMail,
  triggerDailyNotifications,
} from "../controllers/notificationController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.post("/test/week", triggerWeekMail);
router.post("/test/shopping", triggerShoppingMail);
router.post("/test/daily", triggerDailyNotifications);

export default router;