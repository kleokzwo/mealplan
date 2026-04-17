// backend/controllers/authController.js
import {
  register,
  login,
  verifyEmailCode,
  resendVerificationCode,
} from "../services/authService.js";

export async function registerUser(req, res) {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function loginUser(req, res) {
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function verifyEmail(req, res) {
  try {
    const result = await verifyEmailCode(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function resendCode(req, res) {
  try {
    const result = await resendVerificationCode(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}