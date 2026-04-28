// backend/services/userService.js
import {pool} from "../config/db.js";

export async function getUserById(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      email,
      onboarding_completed AS onboardingCompleted,
      household_type AS householdType,
      children_count AS childrenCount,
      notificationPreference
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

export async function updateNotificationPreference(userId, notificationPreference) {
  await pool.query(
    `
    UPDATE users
    SET notificationPreference = ?
    WHERE id = ?
    `,
    [notificationPreference, userId]
  );
}

export async function completeOnboarding(userId, { householdType, childrenCount }) {
  const safeChildrenCount = householdType === "family" ? Number(childrenCount || 0) : 0;

  await pool.query(
    `
    UPDATE users
    SET household_type = ?,
        children_count = ?,
        onboarding_completed = 1
    WHERE id = ?
    `,
    [householdType, safeChildrenCount, userId]
  );
}

export async function updateHouseholdProfile(userId, { householdType, childrenCount }) {
  const safeChildrenCount = householdType === "familie" ? Number(childrenCount || 0) : 0;

  await pool.query(
    `
    UPDATE users
    SET household_type = ?, children_count = ?
    WHERE id = ?
    `,
    [householdType, safeChildrenCount, userId]
  );

  // Wichtig: deine App nutzt zusätzlich app_preferences.
  // Darum muss diese Tabelle mitgezogen werden, sonst bleibt die UI/Planung gefühlt auf dem alten Wert.
  await pool.query(
    `
    UPDATE app_preferences
    SET household_type = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
    `,
    [householdType]
  );
}