import {pool} from "./db.js";

// 🍽️ Meals für HEUTE
export async function getTodayMeals(userId) {
  const [rows] = await pool.query(
    `
    SELECT m.name
    FROM meals m
    JOIN week_meals wm ON wm.meal_id = m.id
    JOIN weeks w ON w.id = wm.week_id
    WHERE w.user_id = ?
      AND wm.date = CURDATE()
    `,
    [userId]
  );

  return rows;
}

// 🛒 offene Einkaufsitems
export async function getOpenShoppingItems() {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM shopping_items
    WHERE is_checked = 0
    `
  );

  return rows;
}
// aktive Woche
export async function getActiveWeekForUser() {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM weeks
    WHERE status = 'active'
    LIMIT 1
    `
  );

  return rows[0] || null;
}


// optionale Rezeptvorschläge
export async function getPendingRecipeSuggestionsCount(userId) {
  try {
    const [rows] = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM recipe_suggestions
      WHERE user_id = ?
        AND is_selected = 0
      `,
      [userId]
    );

    return rows[0]?.count || 0;
  } catch (err) {
    // Tabelle existiert evtl. noch nicht → erstmal stabil bleiben
    console.warn("recipe_suggestions not ready yet, fallback to 0");
    return 0;
  }
}