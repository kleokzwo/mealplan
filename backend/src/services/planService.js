import { pool } from '../config/db.js';

const DAY_LABELS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

const INGREDIENT_LIBRARY = {
  'One-Pot Pasta mit Tomaten': [
    { name: 'Pasta', amount: '500 g', category: 'Trockenware' },
    { name: 'Tomaten', amount: '6 Stück', category: 'Gemüse' },
    { name: 'Knoblauch', amount: '2 Zehen', category: 'Gemüse' },
    { name: 'Parmesan', amount: '100 g', category: 'Kühlregal' },
    { name: 'Basilikum', amount: '1 Bund', category: 'Gemüse' },
  ],
  'Lachs mit Kartoffeln und Brokkoli': [
    { name: 'Lachsfilet', amount: '600 g', category: 'Frischetheke' },
    { name: 'Kartoffeln', amount: '800 g', category: 'Gemüse' },
    { name: 'Brokkoli', amount: '1 Kopf', category: 'Gemüse' },
    { name: 'Zitrone', amount: '1 Stück', category: 'Gemüse' },
    { name: 'Olivenöl', amount: '1 Flasche', category: 'Trockenware' },
  ],
  'Veggie Wraps mit Joghurtsauce': [
    { name: 'Wraps', amount: '8 Stück', category: 'Trockenware' },
    { name: 'Joghurt', amount: '250 g', category: 'Kühlregal' },
    { name: 'Salatmix', amount: '1 Packung', category: 'Gemüse' },
    { name: 'Paprika', amount: '2 Stück', category: 'Gemüse' },
    { name: 'Mais', amount: '1 Dose', category: 'Konserven' },
  ],
  'Hähnchen-Reis-Pfanne': [
    { name: 'Hähnchenbrust', amount: '500 g', category: 'Frischetheke' },
    { name: 'Reis', amount: '400 g', category: 'Trockenware' },
    { name: 'Paprika', amount: '2 Stück', category: 'Gemüse' },
    { name: 'Zwiebeln', amount: '2 Stück', category: 'Gemüse' },
    { name: 'Sojasauce', amount: '1 Flasche', category: 'Trockenware' },
  ],
  'Cremiges Kichererbsen-Curry': [
    { name: 'Kichererbsen', amount: '2 Dosen', category: 'Konserven' },
    { name: 'Kokosmilch', amount: '2 Dosen', category: 'Konserven' },
    { name: 'Reis', amount: '400 g', category: 'Trockenware' },
    { name: 'Spinat', amount: '200 g', category: 'Gemüse' },
    { name: 'Currypaste', amount: '1 Glas', category: 'Konserven' },
  ],
  'Spinat-Feta-Ofenpasta': [
    { name: 'Pasta', amount: '500 g', category: 'Trockenware' },
    { name: 'Spinat', amount: '300 g', category: 'Gemüse' },
    { name: 'Feta', amount: '200 g', category: 'Kühlregal' },
    { name: 'Sahne', amount: '200 ml', category: 'Kühlregal' },
    { name: 'Tomaten', amount: '4 Stück', category: 'Gemüse' },
  ],
  'Fischstäbchen-Bowl mit Erbsenreis': [
    { name: 'Fischstäbchen', amount: '1 Packung', category: 'Tiefkühlung' },
    { name: 'Reis', amount: '400 g', category: 'Trockenware' },
    { name: 'Erbsen', amount: '300 g', category: 'Tiefkühlung' },
    { name: 'Gurke', amount: '1 Stück', category: 'Gemüse' },
    { name: 'Joghurt', amount: '200 g', category: 'Kühlregal' },
  ],
  'Tomaten-Mozzarella-Toasties': [
    { name: 'Toastbrot', amount: '1 Packung', category: 'Backwaren' },
    { name: 'Mozzarella', amount: '2 Kugeln', category: 'Kühlregal' },
    { name: 'Tomaten', amount: '3 Stück', category: 'Gemüse' },
  ],
  'Schnelle Udon-Pfanne': [
    { name: 'Udon-Nudeln', amount: '2 Packungen', category: 'Trockenware' },
    { name: 'Frühlingszwiebeln', amount: '1 Bund', category: 'Gemüse' },
    { name: 'Tofu', amount: '250 g', category: 'Kühlregal' },
  ],
  'Puten-Gemüse-Pfanne': [
    { name: 'Putenstreifen', amount: '500 g', category: 'Frischetheke' },
    { name: 'Gemüsemix', amount: '1 Packung', category: 'Tiefkühlung' },
    { name: 'Reis', amount: '250 g', category: 'Trockenware' },
  ],
  'Kartoffel-Brokkoli-Auflauf': [
    { name: 'Kartoffeln', amount: '1 kg', category: 'Gemüse' },
    { name: 'Brokkoli', amount: '1 Kopf', category: 'Gemüse' },
    { name: 'Käse', amount: '200 g', category: 'Kühlregal' },
  ],
  'Avocado-Bohnen-Tacos': [
    { name: 'Tacos', amount: '1 Packung', category: 'Trockenware' },
    { name: 'Avocado', amount: '2 Stück', category: 'Gemüse' },
    { name: 'Kidneybohnen', amount: '1 Dose', category: 'Konserven' },
  ],
};

const fallbackIngredientsForMeal = (meal) => {
  const categoryFallback = {
    Pasta: [
      { name: 'Pasta', amount: '500 g', category: 'Trockenware' },
      { name: 'Tomaten', amount: '4 Stück', category: 'Gemüse' },
      { name: 'Käse', amount: '150 g', category: 'Kühlregal' },
    ],
    Curry: [
      { name: 'Reis', amount: '400 g', category: 'Trockenware' },
      { name: 'Kokosmilch', amount: '1 Dose', category: 'Konserven' },
      { name: 'Currypaste', amount: '1 Glas', category: 'Konserven' },
    ],
    Wraps: [
      { name: 'Wraps', amount: '8 Stück', category: 'Trockenware' },
      { name: 'Salat', amount: '1 Kopf', category: 'Gemüse' },
      { name: 'Joghurt', amount: '250 g', category: 'Kühlregal' },
    ],
  };

  return categoryFallback[meal.category] || [
    { name: 'Gemüse-Mix', amount: '1 Packung', category: 'Gemüse' },
    { name: 'Gewürze', amount: '1 Packung', category: 'Trockenware' },
  ];
};

const aggregateShoppingList = (meals) => {
  const items = new Map();

  meals.forEach((meal) => {
    const ingredients = INGREDIENT_LIBRARY[meal.title] || fallbackIngredientsForMeal(meal);

    ingredients.forEach((ingredient) => {
      if (!items.has(ingredient.name)) {
        items.set(ingredient.name, {
          name: ingredient.name,
          amount: ingredient.amount,
          category: ingredient.category,
          recipeCount: 1,
        });
        return;
      }

      const existing = items.get(ingredient.name);
      items.set(ingredient.name, {
        ...existing,
        recipeCount: existing.recipeCount + 1,
        amount: `${existing.amount} + ${ingredient.amount}`,
      });
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

const buildPlanPayload = (orderedMeals, weekId = null, shoppingStateMap = new Map()) => {
  const weeklyPlan = orderedMeals.slice(0, DAY_LABELS.length).map((meal, index) => ({
    id: weekId ? `${weekId}-${index}` : null,
    dayIndex: index,
    dayLabel: DAY_LABELS[index],
    meal,
    isCompleted: false,
  }));

  const shoppingList = aggregateShoppingList(weeklyPlan.map((entry) => entry.meal)).map((item, index) => ({
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
  return buildPlanPayload(orderedMeals);
};

export const createActiveWeek = async ({ selectedMealIds }) => {
  const orderedMeals = await getOrderedMealsByIds(selectedMealIds);
  const plan = buildPlanPayload(orderedMeals);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(`UPDATE weeks SET status = 'archived' WHERE status = 'active'`);

    const [weekResult] = await connection.query(
      `INSERT INTO weeks (status, start_date) VALUES ('active', CURRENT_DATE())`
    );

    const weekId = weekResult.insertId;

    for (const entry of plan.weeklyPlan) {
      await connection.query(
        `INSERT INTO week_days (week_id, day_index, day_label, meal_id, is_completed)
         VALUES (?, ?, ?, ?, FALSE)`,
        [weekId, entry.dayIndex, entry.dayLabel, entry.meal.id]
      );
    }

    for (const item of plan.shoppingList) {
      await connection.query(
        `INSERT INTO shopping_items (week_id, name, amount, category, recipe_count, is_checked)
         VALUES (?, ?, ?, ?, ?, FALSE)`,
        [weekId, item.name, item.amount, item.category, item.recipeCount]
      );
    }

    await connection.commit();
    return getActiveWeek();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getActiveWeek = async () => {
  const [weeks] = await pool.query(
    `SELECT id, status, start_date AS startDate, created_at AS createdAt
     FROM weeks
     WHERE status = 'active'
     ORDER BY created_at DESC
     LIMIT 1`
  );

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

  const [items] = await pool.query(
    `SELECT id, name, amount, category, recipe_count AS recipeCount, is_checked AS isChecked
     FROM shopping_items
     WHERE week_id = ?
     ORDER BY category ASC, name ASC`,
    [activeWeek.id]
  );

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

export const updateShoppingItemStatus = async ({ itemId, isChecked }) => {
  const parsedId = Number(itemId);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    const error = new Error('Ungültige Einkaufslisten-ID.');
    error.statusCode = 400;
    throw error;
  }

  await pool.query(
    `UPDATE shopping_items si
     INNER JOIN weeks w ON w.id = si.week_id
     SET si.is_checked = ?
     WHERE si.id = ? AND w.status = 'active'`,
    [Boolean(isChecked), parsedId]
  );

  return getActiveWeek();
};

export const clearActiveWeek = async () => {
  const [result] = await pool.query(`DELETE FROM weeks WHERE status = 'active'`);
  return { deletedWeeks: result.affectedRows };
};
