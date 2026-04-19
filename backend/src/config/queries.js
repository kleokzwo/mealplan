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

// ✅ aktive Woche für User laden
export async function getActiveWeekForUser(userId) {
  const [rows] = await pool.query(
    `SELECT * FROM weeks WHERE status = 'active' AND user_id = ? LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}


// ✅ konkrete Week-Meal-Suggestions für eine Woche laden
export async function getWeekMealSuggestionsByWeekId(weekId) {
  const [rows] = await pool.query(
    `
    SELECT 
      wms.id,
      wms.week_id,
      wms.meal_suggestion_id,
      wms.status,
      wms.created_at,
      wms.updated_at,
      ms.title,
      ms.category,
      ms.diet_type AS dietType,
      ms.cooking_time_minutes AS cookingTimeMinutes,
      ms.difficulty,
      ms.family_friendly AS familyFriendly,
      ms.household_fit AS householdFit,
      ms.tags
    FROM week_meal_suggestions wms
    JOIN meal_suggestions ms ON wms.meal_suggestion_id = ms.id
    WHERE wms.week_id = ?
    ORDER BY wms.created_at ASC
    `,
    [weekId]
  );

  return rows;
}

// ✅ einzelne konkrete Suggestion erzeugen
export async function createWeekMealSuggestion(
  weekId,
  mealSuggestionId,
  status = "pending"
) {
  const [result] = await pool.query(
    `
    INSERT INTO week_meal_suggestions (week_id, meal_suggestion_id, status)
    VALUES (?, ?, ?)
    `,
    [weekId, mealSuggestionId, status]
  );

  return result.insertId;
}

// ✅ prüfen, ob konkrete Suggestion schon existiert
export async function getWeekMealSuggestionByWeekAndMeal(weekId, mealSuggestionId) {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM week_meal_suggestions
    WHERE week_id = ?
      AND meal_suggestion_id = ?
    LIMIT 1
    `,
    [weekId, mealSuggestionId]
  );

  return rows[0] || null;
}

// ✅ Status aktualisieren
export async function updateWeekMealSuggestionStatus(id, status) {
  const [result] = await pool.query(
    `
    UPDATE week_meal_suggestions
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
    [status, id]
  );

  return result.affectedRows > 0;
}

// ✅ einzelne Suggestion + Besitzprüfung laden
export async function getWeekMealSuggestionById(id) {
  const [rows] = await pool.query(
    `
    SELECT 
      wms.*,
      w.user_id
    FROM week_meal_suggestions wms
    JOIN weeks w ON wms.week_id = w.id
    WHERE wms.id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}