import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const router = express.Router();

router.post('/seed-user', async (req, res) => {
  try {
    const {
      name = 'E2E Test User',
      email,
      password = 'TestPassword123!',
      onboardingCompleted = 0,
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email fehlt.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query('DELETE FROM users WHERE email = ?', [email]);

    await pool.query(
    `INSERT INTO users 
    (name, email, password_hash, is_email_verified, onboarding_completed)
    VALUES (?, ?, ?, 1, ?)`,
    [name, email, passwordHash, onboardingCompleted]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('seed-user failed:', error);
    res.status(500).json({
      error: 'Seed user failed',
      message: error.message,
    });
  }
});

router.delete('/cleanup-user', async (req, res) => {
  try {
    const { email } = req.body;

    await pool.query('DELETE FROM users WHERE email = ?', [email]);

    res.json({ success: true });
  } catch (error) {
    console.error('cleanup-user failed:', error);
    res.status(500).json({
      error: 'Cleanup user failed',
      message: error.message,
    });
  }
});

router.post('/seed-meals', async (req, res) => {
  try {
    await pool.query(`DELETE FROM meal_ingredients WHERE name LIKE 'E2E Zutat%'`);
    await pool.query(`DELETE FROM meal_suggestions WHERE title LIKE 'E2E Gericht%'`);

    for (let i = 1; i <= 7; i++) {
      const [result] = await pool.query(
        `INSERT INTO meal_suggestions
         (title, category, diet_type, cooking_time_minutes, difficulty, family_friendly, household_fit, tags, image_url)
         VALUES (?, 'E2E', 'all', 20, 'einfach', 1, 'single', 'e2e,ultraschnell', NULL)`,
        [`E2E Gericht ${i}`]
      );

      await pool.query(
        `INSERT INTO meal_ingredients
         (meal_id, name, amount, category)
         VALUES (?, ?, '1 Stück', 'E2E')`,
        [result.insertId, `E2E Zutat ${i}`]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('seed-meals failed:', error);
    res.status(500).json({
      error: 'Seed meals failed',
      message: error.message,
    });
  }
});

export default router;