// frontend/src/api/authApi.js
import { httpClient } from "./httpClient";

export async function registerUser({ email, password }) {
  return httpClient.post("/auth/register", {
    email,
    password,
  });
}

export async function verifyEmailCode({ email, code }) {
  return httpClient.post("/auth/verify-email", {
    email,
    code,
  });
}

export async function resendVerificationCode({ email }) {
  return httpClient.post("/auth/resend-code", {
    email,
  });
}

export async function loginUser({ email, password }) {
  return httpClient.post("/auth/login", {
    email,
    password,
  });
}