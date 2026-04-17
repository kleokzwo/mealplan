// backend/db/userQueries.js

import {pool} from "./db.js";

export async function getAllUsers() {
  const [rows] = await pool.query(`
    SELECT id, email, notificationPreference
    FROM users
  `);

  return rows;
}