// backend/services/authService.js
import {pool} from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendMail } from "./mailService.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getVerificationExpiryDate() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 10);
  return date;
}

function createToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
}

export async function register({ email, password }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const safePassword = String(password || "");

  if (!normalizedEmail) {
    throw new Error("E-Mail fehlt");
  }

  if (!safePassword || safePassword.length < 6) {
    throw new Error("Passwort muss mindestens 6 Zeichen haben");
  }

  const [existingRows] = await pool.query(
    `SELECT id, is_email_verified FROM users WHERE email = ? LIMIT 1`,
    [normalizedEmail]
  );

  if (existingRows.length > 0) {
    throw new Error("E-Mail ist bereits registriert");
  }

  const passwordHash = await bcrypt.hash(safePassword, 10);
  const code = generateVerificationCode();
  const expiresAt = getVerificationExpiryDate();

  const [result] = await pool.query(
    `
    INSERT INTO users (
      email,
      password_hash,
      notificationPreference,
      is_email_verified,
      email_verification_code,
      email_verification_expires_at,
      children_count,
      onboarding_completed
    )
    VALUES (?, ?, 'täglich', 0, ?, ?, 0, 0)
    `,
    [normalizedEmail, passwordHash, code, expiresAt]
  );

  await sendMail({
    to: normalizedEmail,
    subject: "Dein Bestätigungscode",
    html: `
      <h2>Dein Code</h2>
      <p>Nutze diesen Code, um deine E-Mail zu bestätigen:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${code}</p>
      <p>Der Code ist 10 Minuten gültig.</p>
    `,
  });

  return {
    success: true,
    email: normalizedEmail,
    userId: result.insertId,
  };
}

export async function resendVerificationCode({ email }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("E-Mail fehlt");
  }

  const [rows] = await pool.query(
    `SELECT id, is_email_verified FROM users WHERE email = ? LIMIT 1`,
    [normalizedEmail]
  );

  const user = rows[0];

  if (!user) {
    throw new Error("User nicht gefunden");
  }

  if (user.is_email_verified) {
    throw new Error("E-Mail ist bereits bestätigt");
  }

  const code = generateVerificationCode();
  const expiresAt = getVerificationExpiryDate();

  await pool.query(
    `
    UPDATE users
    SET email_verification_code = ?,
        email_verification_expires_at = ?
    WHERE id = ?
    `,
    [code, expiresAt, user.id]
  );

  await sendMail({
    to: normalizedEmail,
    subject: "Dein neuer Bestätigungscode",
    html: `
      <h2>Dein neuer Code</h2>
      <p>Nutze diesen Code, um deine E-Mail zu bestätigen:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${code}</p>
      <p>Der Code ist 10 Minuten gültig.</p>
    `,
  });

  return { success: true };
}

export async function verifyEmailCode({ email, code }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const safeCode = String(code || "").trim();

  if (!normalizedEmail || !safeCode) {
    throw new Error("E-Mail oder Code fehlt");
  }

  const [rows] = await pool.query(
    `
    SELECT id, email_verification_code, email_verification_expires_at, is_email_verified
    FROM users
    WHERE email = ?
    LIMIT 1
    `,
    [normalizedEmail]
  );

  const user = rows[0];

  if (!user) {
    throw new Error("User nicht gefunden");
  }

  if (user.is_email_verified) {
    const token = createToken(user.id);
    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: normalizedEmail,
      },
    };
  }

  if (!user.email_verification_code) {
    throw new Error("Kein Verifizierungscode vorhanden");
  }

  if (user.email_verification_code !== safeCode) {
    throw new Error("Code ist ungültig");
  }

  const expiresAt = user.email_verification_expires_at
    ? new Date(user.email_verification_expires_at)
    : null;

  if (!expiresAt || expiresAt.getTime() < Date.now()) {
    throw new Error("Code ist abgelaufen");
  }

  await pool.query(
    `
    UPDATE users
    SET is_email_verified = 1,
        email_verification_code = NULL,
        email_verification_expires_at = NULL
    WHERE id = ?
    `,
    [user.id]
  );

  const token = createToken(user.id);

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: normalizedEmail,
    },
  };
}

export async function login({ email, password }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const safePassword = String(password || "");

  const [rows] = await pool.query(
    `SELECT * FROM users WHERE email = ? LIMIT 1`,
    [normalizedEmail]
  );

  const user = rows[0];

  if (!user) {
    throw new Error("User nicht gefunden");
  }

  const valid = await bcrypt.compare(safePassword, user.password_hash);

  if (!valid) {
    throw new Error("Falsches Passwort");
  }

  if (!user.is_email_verified) {
    throw new Error("E-Mail noch nicht bestätigt");
  }

  const token = createToken(user.id);

  return { token };
}