// backend/routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendCode,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-code", resendCode);

export default router;