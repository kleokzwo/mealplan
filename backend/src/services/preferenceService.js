import { pool } from '../config/db.js';

const DEFAULT_PREFERENCES = {
  householdType: 'familie',
  dietType: 'all',
  maxCookingTime: 25,
  onboarded: false,
};

const mapPreferenceRow = (row) => ({
  householdType: row.householdType,
  dietType: row.dietType,
  maxCookingTime: Number(row.maxCookingTime),
  onboarded: Boolean(row.onboarded),
});

export const getPreferences = async () => {
  const [rows] = await pool.query(
    `SELECT household_type AS householdType, diet_type AS dietType,
            max_cooking_time AS maxCookingTime, onboarded
     FROM app_preferences
     WHERE id = 1
     LIMIT 1`
  );

  return rows[0] ? mapPreferenceRow(rows[0]) : DEFAULT_PREFERENCES;
};

export const savePreferences = async ({ householdType, dietType, maxCookingTime, onboarded = true }) => {
  const safePreferences = {
    householdType: ['single', 'paar', 'familie'].includes(householdType) ? householdType : 'familie',
    dietType: ['all', 'omnivore', 'vegetarisch', 'vegan', 'fisch'].includes(dietType) ? dietType : 'all',
    maxCookingTime: [15, 20, 25, 30, 35].includes(Number(maxCookingTime)) ? Number(maxCookingTime) : 25,
    onboarded: Boolean(onboarded),
  };

  await pool.query(
    `INSERT INTO app_preferences (id, household_type, diet_type, max_cooking_time, onboarded)
     VALUES (1, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       household_type = VALUES(household_type),
       diet_type = VALUES(diet_type),
       max_cooking_time = VALUES(max_cooking_time),
       onboarded = VALUES(onboarded)`,
    [safePreferences.householdType, safePreferences.dietType, safePreferences.maxCookingTime, safePreferences.onboarded]
  );

  return safePreferences;
};
