import { pool } from '../config/db.js';

const DAY_LABELS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];


const getIngredientsForMealsFromDb = async (meals) => {
  const mealIds = meals
    .map((meal) => Number(meal.id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (mealIds.length === 0) {
    return [];
  }

  const placeholders = mealIds.map(() => '?').join(', ');

  const [rows] = await pool.query(
    `
    SELECT meal_id AS mealId, name, amount, category
    FROM meal_ingredients
    WHERE meal_id IN (${placeholders})
    `,
    mealIds
  );

  return rows.map((row) => ({
    mealId: Number(row.mealId),
    name: row.name,
    amount: row.amount || '',
    category: row.category || 'Sonstiges',
  }));
};

const aggregateShoppingList = async (meals) => {
  const items = new Map();

  const dbIngredients = await getIngredientsForMealsFromDb(meals);

  dbIngredients.forEach((ingredient) => {
    const key = ingredient.name.trim().toLowerCase();

    if (!items.has(key)) {
      items.set(key, {
        name: ingredient.name,
        amount: ingredient.amount || '',
        category: ingredient.category || 'Sonstiges',
        recipeCount: 1,
      });
      return;
    }

    const existing = items.get(key);

    items.set(key, {
      ...existing,
      recipeCount: existing.recipeCount + 1,
      amount: [existing.amount, ingredient.amount].filter(Boolean).join(' + '),
    });
  });

  return Array.from(items.values()).sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category, 'de');
    }

    return a.name.localeCompare(b.name, 'de');
  });
};

const getOrderedMealsByIds = async (selectedMealIds) => {
  const ids = Array.isArray(selectedMealIds)
    ? selectedMealIds.map(Number).filter((value) => Number.isInteger(value) && value > 0)
    : [];

  if (ids.length < 3) {
    const error = new Error('Bitte wähle mindestens 3 Gerichte aus.');
    error.statusCode = 400;
    throw error;
  }

  const placeholders = ids.map(() => '?').join(', ');
  const query = `
    SELECT id, title, category, diet_type AS dietType, cooking_time_minutes AS cookingTimeMinutes,
           difficulty, family_friendly AS familyFriendly, household_fit AS householdFit,
           tags, image_url AS imageUrl
    FROM meal_suggestions
    WHERE id IN (${placeholders})
  `;

  const [rows] = await pool.query(query, ids);
  const mealMap = new Map(rows.map((meal) => [meal.id, {
    ...meal,
    familyFriendly: Boolean(meal.familyFriendly),
    tags: meal.tags ? meal.tags.split(',').map((tag) => tag.trim()) : [],
  }]));
  const orderedMeals = ids.map((id) => mealMap.get(id)).filter(Boolean);

  if (orderedMeals.length < 3) {
    const error = new Error('Nicht alle ausgewählten Gerichte konnten gefunden werden.');
    error.statusCode = 404;
    throw error;
  }

  return orderedMeals;
};

const buildPlanPayload = async (orderedMeals, weekId = null, shoppingStateMap = new Map()) => {
  const weeklyPlan = orderedMeals.slice(0, DAY_LABELS.length).map((meal, index) => ({
    id: weekId ? `${weekId}-${index}` : null,
    dayIndex: index,
    dayLabel: DAY_LABELS[index],
    meal,
    isCompleted: false,
  }));

  const shoppingList = (await aggregateShoppingList(weeklyPlan.map((entry) => entry.meal))).map((item, index) => ({
    id: weekId ? `${weekId}-shop-${index}` : null,
    ...item,
    isChecked: Boolean(shoppingStateMap.get(item.name)),
  }));

  return {
    id: weekId,
    selectedMeals: orderedMeals,
    weeklyPlan,
    shoppingList,
    summary: {
      totalMeals: weeklyPlan.length,
      totalShoppingItems: shoppingList.length,
      checkedShoppingItems: shoppingList.filter((item) => item.isChecked).length,
      estimatedCookingMinutes: weeklyPlan.reduce((total, entry) => total + entry.meal.cookingTimeMinutes, 0),
    },
  };
};

export const generateWeeklyPlan = async ({ selectedMealIds }) => {
  const orderedMeals = await getOrderedMealsByIds(selectedMealIds);
  return await buildPlanPayload(orderedMeals);
};

export const createActiveWeek = async ({ selectedMealIds, userId = null }) => {
  const orderedMeals = await getOrderedMealsByIds(selectedMealIds);
  const plan = await buildPlanPayload(orderedMeals);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    if (userId) {
      await connection.query(
        `UPDATE weeks SET status = 'archived' WHERE status = 'active' AND user_id = ?`,
        [userId]
      );
    } else {
      await connection.query(`UPDATE weeks SET status = 'archived' WHERE status = 'active'`);
    }

    let weekResult;

    if (userId) {
      [weekResult] = await connection.query(
        `INSERT INTO weeks (user_id, status, start_date) VALUES (?, 'active', CURRENT_DATE())`,
        [userId]
      );
    } else {
      [weekResult] = await connection.query(
        `INSERT INTO weeks (status, start_date) VALUES ('active', CURRENT_DATE())`
      );
    }

    const weekId = weekResult.insertId;

    for (const entry of plan.weeklyPlan) {
      await connection.query(
        `INSERT INTO week_days (week_id, day_index, day_label, meal_id, is_completed)
         VALUES (?, ?, ?, ?, FALSE)`,
        [weekId, entry.dayIndex, entry.dayLabel, entry.meal.id]
      );
    }

    for (const item of plan.shoppingList) {
      if (userId) {
        await connection.query(
          `INSERT INTO shopping_items (user_id, week_id, name, amount, category, recipe_count, is_checked)
           VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
          [userId, weekId, item.name, item.amount, item.category, item.recipeCount]
        );
      } else {
        await connection.query(
          `INSERT INTO shopping_items (week_id, name, amount, category, recipe_count, is_checked)
           VALUES (?, ?, ?, ?, ?, FALSE)`,
          [weekId, item.name, item.amount, item.category, item.recipeCount]
        );
      }
    }

    await connection.commit();
    return getActiveWeek(userId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getActiveWeek = async (userId = null) => {
  let weeks;
  if (userId) {
    [weeks] = await pool.query(
      `SELECT id, status, start_date AS startDate, created_at AS createdAt
       FROM weeks
       WHERE status = 'active' AND user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );
  } else {
    [weeks] = await pool.query(
      `SELECT id, status, start_date AS startDate, created_at AS createdAt
       FROM weeks
       WHERE status = 'active'
       ORDER BY created_at DESC
       LIMIT 1`
    );
  }

  const activeWeek = weeks[0];
  if (!activeWeek) {
    return null;
  }

  const [days] = await pool.query(
    `SELECT wd.id, wd.day_index AS dayIndex, wd.day_label AS dayLabel, wd.is_completed AS isCompleted,
            ms.id AS mealId, ms.title, ms.category, ms.diet_type AS dietType,
            ms.cooking_time_minutes AS cookingTimeMinutes, ms.difficulty,
            ms.family_friendly AS familyFriendly, ms.household_fit AS householdFit,
            ms.tags, ms.image_url AS imageUrl
     FROM week_days wd
     INNER JOIN meal_suggestions ms ON ms.id = wd.meal_id
     WHERE wd.week_id = ?
     ORDER BY wd.day_index ASC`,
    [activeWeek.id]
  );

  let items;
  if (userId) {
    [items] = await pool.query(
      `SELECT id, name, amount, category, recipe_count AS recipeCount, is_checked AS isChecked
       FROM shopping_items
       WHERE week_id = ? AND user_id = ? AND archived_at IS NULL
       ORDER BY category ASC, name ASC`,
      [activeWeek.id, userId]
    );
  } else {
    [items] = await pool.query(
      `SELECT id, name, amount, category, recipe_count AS recipeCount, is_checked AS isChecked
       FROM shopping_items
       WHERE week_id = ? AND archived_at IS NULL
       ORDER BY category ASC, name ASC`,
      [activeWeek.id]
    );
  }

  const weeklyPlan = days.map((entry) => ({
    id: entry.id,
    dayIndex: entry.dayIndex,
    dayLabel: entry.dayLabel,
    isCompleted: Boolean(entry.isCompleted),
    meal: {
      id: entry.mealId,
      title: entry.title,
      category: entry.category,
      dietType: entry.dietType,
      cookingTimeMinutes: entry.cookingTimeMinutes,
      difficulty: entry.difficulty,
      familyFriendly: Boolean(entry.familyFriendly),
      householdFit: entry.householdFit,
      tags: entry.tags ? entry.tags.split(',').map((tag) => tag.trim()) : [],
      imageUrl: entry.imageUrl,
    },
  }));

  const shoppingList = items.map((item) => ({
    ...item,
    isChecked: Boolean(item.isChecked),
  }));

  return {
    id: activeWeek.id,
    status: activeWeek.status,
    startDate: activeWeek.startDate,
    createdAt: activeWeek.createdAt,
    weeklyPlan,
    shoppingList,
    summary: {
      totalMeals: weeklyPlan.length,
      totalShoppingItems: shoppingList.length,
      checkedShoppingItems: shoppingList.filter((item) => item.isChecked).length,
      estimatedCookingMinutes: weeklyPlan.reduce((sum, entry) => sum + entry.meal.cookingTimeMinutes, 0),
    },
  };
};

export const updateShoppingItemStatus = async ({ itemId, isChecked, userId = null }) => {
  const parsedId = Number(itemId);

  if (userId) {
    await pool.query(
      `UPDATE shopping_items si
       INNER JOIN weeks w ON w.id = si.week_id
       SET si.is_checked = ?
       WHERE si.id = ? AND si.user_id = ? AND w.status = 'active'`,
      [isChecked ? 1 : 0, parsedId, userId]
    );
  } else {
    await pool.query(
      `UPDATE shopping_items si
       INNER JOIN weeks w ON w.id = si.week_id
       SET si.is_checked = ?
       WHERE si.id = ? AND w.status = 'active'`,
      [isChecked ? 1 : 0, parsedId]
    );
  }

  return getActiveWeek(userId);
};

export const clearActiveWeek = async (userId = null) => {
  let result;

  if (userId) {
    [result] = await pool.query(
      `UPDATE weeks SET status = 'archived' WHERE status = 'active' AND user_id = ?`,
      [userId]
    );

    await pool.query(
      `UPDATE shopping_items si
       INNER JOIN weeks w ON w.id = si.week_id
       SET si.archived_at = NOW(),
           si.expires_at = DATE_ADD(NOW(), INTERVAL 28 DAY)
       WHERE w.user_id = ? AND si.archived_at IS NULL`,
      [userId]
    );
  } else {
    [result] = await pool.query(`DELETE FROM weeks WHERE status = 'active'`);
  }

  return { deletedWeeks: result.affectedRows };
};

export const deleteShoppingItem = async ({ itemId, userId = null }) => {
  const parsedId = Number(itemId);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    const error = new Error('Ungültige Einkaufslisten-ID.');
    error.statusCode = 400;
    throw error;
  }

  let result;

  if (userId) {
    [result] = await pool.query(
      `DELETE si
       FROM shopping_items si
       INNER JOIN weeks w ON w.id = si.week_id
       WHERE si.id = ? AND si.user_id = ? AND w.status = 'active'`,
      [parsedId, userId]
    );
  } else {
    [result] = await pool.query(
      `DELETE si
       FROM shopping_items si
       INNER JOIN weeks w ON w.id = si.week_id
       WHERE si.id = ? AND w.status = 'active'`,
      [parsedId]
    );
  }

  if (result.affectedRows === 0) {
    const error = new Error('Einkaufslistenpunkt nicht gefunden.');
    error.statusCode = 404;
    throw error;
  }

  return getActiveWeek(userId);
};

export const updateShoppingItemDetails = async ({
  itemId,
  name,
  quantity,
  unit,
  category,
  userId = null,
}) => {
  const parsedId = Number(itemId);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    const error = new Error('Ungültige Einkaufslisten-ID.');
    error.statusCode = 400;
    throw error;
  }

  let result;

  if (userId) {
    [result] = await pool.query(
      `UPDATE shopping_items si
       INNER JOIN weeks w ON w.id = si.week_id
       SET si.name = ?, si.amount = ?, si.category = ?
       WHERE si.id = ? AND si.user_id = ? AND w.status = 'active'`,
      [
        name,
        quantity ?? null,
        category ?? 'Sonstiges',
        parsedId,
        userId,
      ]
    );
  } else {
    [result] = await pool.query(
      `UPDATE shopping_items si
       INNER JOIN weeks w ON w.id = si.week_id
       SET si.name = ?, si.amount = ?, si.category = ?
       WHERE si.id = ? AND w.status = 'active'`,
      [
        name,
        quantity ?? null,
        category ?? 'Sonstiges',
        parsedId,
      ]
    );
  }

  if (result.affectedRows === 0) {
    const error = new Error('Einkaufslistenpunkt nicht gefunden.');
    error.statusCode = 404;
    throw error;
  }

  return getActiveWeek(userId);
};