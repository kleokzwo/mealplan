import { pool } from '../config/db.js';

// Wochentage (jetzt mit Samstag & Sonntag)
const DAY_LABELS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

// Subscription-Limits (zentral definiert)
const SUBSCRIPTION_LIMITS = {
  FREE: 10,      // Free: max. 10 Gerichte pro Generierung
  PRO: Infinity  // Pro: unbegrenzt
};

/**
 * NEU: Holt den Subscription-Plan eines Users aus der Datenbank
 */
const getUserSubscriptionPlan = async (userId) => {
  if (!userId) {
    return 'FREE'; // Nicht eingeloggte User = Free-Tier
  }
  
  const [rows] = await pool.query(
    `SELECT subscription_plan FROM users WHERE id = ?`,
    [userId]
  );
  
  if (rows.length === 0) {
    return 'FREE'; // Fallback, falls User nicht existiert
  }
  
  return rows[0].subscription_plan || 'FREE';
};

/**
 * NEU: Validiert, ob ein User die gewünschte Anzahl generieren darf
 */
const validateGenerationLimit = async (userId, requestedCount) => {
  const plan = await getUserSubscriptionPlan(userId);
  const limit = SUBSCRIPTION_LIMITS[plan] || SUBSCRIPTION_LIMITS.FREE;
  
  if (limit !== Infinity && requestedCount > limit) {
    const error = new Error(`Dein ${plan}-Abonnement erlaubt maximal ${limit} Gerichte pro Generierung. Upgrade auf Pro für unbegrenzte Vorschläge.`);
    error.statusCode = 403;
    error.subscriptionTier = plan;
    error.allowedLimit = limit;
    throw error;
  }
  
  return { plan, limit };
};

/**
 * HELFER: Validiert und dedupliziert Meal IDs
 */
const validateAndDeduplicateMealIds = (selectedMealIds) => {
  return [...new Map(
    (Array.isArray(selectedMealIds) ? selectedMealIds : [])
      .map(Number)
      .filter((value) => Number.isInteger(value) && value > 0)
      .map(id => [id, id])
  ).values()];
};

/**
 * HELFER: Wendet das Generierungs-Limit an (zufällige Auswahl)
 */
const applyGenerationLimit = (meals, limit) => {
  if (limit === Infinity || meals.length <= limit) {
    return meals;
  }
  
  // Fisher-Yates Shuffle für zufällige Auswahl
  const shuffled = [...meals];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, limit);
};

/**
 * BUGFIX 1 & optimiert: Holt Zutaten mit sortierten Mengen
 */
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
    const amount = ingredient.amount || '';

    if (!items.has(key)) {
      items.set(key, {
        name: ingredient.name,
        amount: amount,
        category: ingredient.category || 'Sonstiges',
        recipeCount: 1,
        amounts: [amount]
      });
      return;
    }

    const existing = items.get(key);
    existing.amounts.push(amount);
    existing.recipeCount++;
    
    // Versuche Zahlen zu summieren
    const allAmounts = existing.amounts.filter(a => a && a !== '');
    const canSum = trySumAmounts(allAmounts);
    
    if (canSum) {
      existing.amount = canSum;
    } else {
      // Entferne Duplikate für saubere Darstellung
      const uniqueAmounts = [...new Set(allAmounts)];
      existing.amount = uniqueAmounts.join(' + ');
    }
    
    items.set(key, existing);
  });

  return Array.from(items.values())
    .map(({ amounts, ...rest }) => rest)
    .sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category, 'de');
      }
      return a.name.localeCompare(b.name, 'de');
    });
};

// Hilfsfunktion zum Summieren von Mengen
const trySumAmounts = (amounts) => {
  // Prüfe ob alle Mengen das gleiche Format haben
  const firstAmount = amounts[0];
  const matchPattern = firstAmount.match(/^(\d+(?:[.,]\d+)?)\s*(.+)$/);
  
  if (!matchPattern) return null;
  
  const firstUnit = matchPattern[2].trim().toLowerCase();
  let total = 0;
  let allMatch = true;
  
  for (const amt of amounts) {
    const match = amt.match(/^(\d+(?:[.,]\d+)?)\s*(.+)$/);
    if (!match) {
      allMatch = false;
      break;
    }
    
    const unit = match[2].trim().toLowerCase();
    if (unit !== firstUnit) {
      allMatch = false;
      break;
    }
    
    let value = parseFloat(match[1].replace(',', '.'));
    total += value;
  }
  
  if (!allMatch) return null;
  
  // Formatiere das Ergebnis
  if (Number.isInteger(total)) {
    return `${total} ${firstUnit}`;
  } else {
    return `${total.toFixed(1)} ${firstUnit}`;
  }
};

/**
 * BUGFIX 3: Holt bestellte Gerichte ohne Duplikate
 */
const getOrderedMealsByIds = async (selectedMealIds) => {
  const uniqueIds = validateAndDeduplicateMealIds(selectedMealIds);

  if (uniqueIds.length < 3) {
    const error = new Error('Bitte wähle mindestens 3 verschiedene Gerichte aus.');
    error.statusCode = 400;
    throw error;
  }

  const placeholders = uniqueIds.map(() => '?').join(', ');
  const query = `
    SELECT id, title, category, diet_type AS dietType, cooking_time_minutes AS cookingTimeMinutes,
           difficulty, family_friendly AS familyFriendly, household_fit AS householdFit,
           tags, image_url AS imageUrl
    FROM meal_suggestions
    WHERE id IN (${placeholders})
  `;

  const [rows] = await pool.query(query, uniqueIds);
  const mealMap = new Map(rows.map((meal) => [meal.id, {
    ...meal,
    familyFriendly: Boolean(meal.familyFriendly),
    tags: meal.tags ? meal.tags.split(',').map((tag) => tag.trim()) : [],
  }]));
  
  const orderedMeals = uniqueIds.map((id) => mealMap.get(id)).filter(Boolean);

  if (orderedMeals.length < 3) {
    const error = new Error('Nicht alle ausgewählten Gerichte konnten gefunden werden.');
    error.statusCode = 404;
    throw error;
  }

  return orderedMeals;
};

/**
 * NEU/VERBESSERT: Generiert zufällige Meal-Vorschläge mit User-Subscription
 */
export const generateRandomMealSuggestions = async (userId = null, customLimit = null) => {
  // Subscription-Logik basierend auf User (nicht auf Parameter)
  const plan = await getUserSubscriptionPlan(userId);
  const maxLimit = customLimit || SUBSCRIPTION_LIMITS[plan] || SUBSCRIPTION_LIMITS.FREE;
  
  let query = `
    SELECT id, title, category, diet_type AS dietType, cooking_time_minutes AS cookingTimeMinutes,
           difficulty, family_friendly AS familyFriendly, household_fit AS householdFit,
           tags, image_url AS imageUrl
    FROM meal_suggestions
    WHERE is_active = 1
  `;
  
  const params = [];
  
  if (maxLimit !== Infinity) {
    query += ` ORDER BY RAND() LIMIT ?`;
    params.push(maxLimit);
  } else {
    query += ` ORDER BY RAND()`;
  }
  
  const [rows] = await pool.query(query, params);
  
  return {
    meals: rows.map((meal) => ({
      ...meal,
      familyFriendly: Boolean(meal.familyFriendly),
      tags: meal.tags ? meal.tags.split(',').map((tag) => tag.trim()) : [],
    })),
    subscriptionTier: plan,
    limitApplied: maxLimit !== Infinity ? maxLimit : null
  };
};

/**
 * VERBESSERT: generateWeeklyPlan mit User-basierter Subscription
 */
export const generateWeeklyPlan = async ({ selectedMealIds = null, userId = null }) => {
  // 1. Subscription des Users ermitteln
  const subscriptionPlan = await getUserSubscriptionPlan(userId);
  const limit = SUBSCRIPTION_LIMITS[subscriptionPlan] || SUBSCRIPTION_LIMITS.FREE;
  
  let orderedMeals;
  
  if (selectedMealIds && selectedMealIds.length > 0) {
    // Spezifische Gerichte wurden ausgewählt
    orderedMeals = await getOrderedMealsByIds(selectedMealIds);
    
    // Prüfe, ob User überhaupt so viele Gerichte anfragen darf
    if (limit !== Infinity && orderedMeals.length > limit) {
      const error = new Error(
        `Dein ${subscriptionPlan}-Abonnement erlaubt maximal ${limit} Gerichte pro Woche. ` +
        `Du hast ${orderedMeals.length} ausgewählt. Bitte reduziere die Auswahl oder upgrade auf Pro.`
      );
      error.statusCode = 403;
      error.subscriptionTier = subscriptionPlan;
      error.allowedLimit = limit;
      error.requestedCount = orderedMeals.length;
      throw error;
    }
  } else {
    // Generiere zufällige Vorschläge basierend auf Subscription
    const randomResult = await generateRandomMealSuggestions(userId, DAY_LABELS.length);
    orderedMeals = randomResult.meals;
    
    if (orderedMeals.length < 3) {
      const error = new Error('Nicht genügend aktive Gerichte für den Wochenplan verfügbar.');
      error.statusCode = 404;
      throw error;
    }
  }
  
  // Verwende nur so viele Gerichte, wie Wochentage vorhanden sind (jetzt 7)
  const limitedMeals = orderedMeals.slice(0, DAY_LABELS.length);
  
  const plan = await buildPlanPayload(limitedMeals);
  
  // Füge Subscription-Info zum Response hinzu
  return {
    ...plan,
    subscriptionTier: subscriptionPlan,
    generationLimit: limit !== Infinity ? limit : 'unbegrenzt'
  };
};

/**
 * BUGFIX 2: buildPlanPayload mit sicherer shoppingStateMap-Behandlung
 */
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
    isChecked: shoppingStateMap && typeof shoppingStateMap.get === 'function' 
      ? Boolean(shoppingStateMap.get(item.name)) 
      : false,
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
      estimatedCookingMinutes: weeklyPlan.reduce((total, entry) => total + (entry.meal.cookingTimeMinutes || 0), 0),
    },
  };
};

/**
 * VERBESSERT: createActiveWeek mit User-basierter Subscription
 */
export const createActiveWeek = async ({ selectedMealIds = null, userId = null }) => {
  // 1. Subscription des Users ermitteln und validieren
  const subscriptionPlan = await getUserSubscriptionPlan(userId);
  const limit = SUBSCRIPTION_LIMITS[subscriptionPlan] || SUBSCRIPTION_LIMITS.FREE;
  
  let orderedMeals;
  
  if (selectedMealIds && selectedMealIds.length > 0) {
    orderedMeals = await getOrderedMealsByIds(selectedMealIds);
    
    // Prüfe Limit vor dem Speichern
    if (limit !== Infinity && orderedMeals.length > limit) {
      const error = new Error(
        `Dein ${subscriptionPlan}-Abonnement erlaubt maximal ${limit} Gerichte pro Woche.`
      );
      error.statusCode = 403;
      throw error;
    }
  } else {
    // Generiere zufällige Vorschläge basierend auf Subscription
    const randomResult = await generateRandomMealSuggestions(userId, DAY_LABELS.length);
    orderedMeals = randomResult.meals;
  }
  
  const plan = await buildPlanPayload(orderedMeals, null, new Map());

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Archiviere alte aktive Wochen
    if (userId) {
      await connection.query(
        `UPDATE weeks SET status = 'archived' WHERE status = 'active' AND user_id = ?`,
        [userId]
      );
    } else {
      await connection.query(`UPDATE weeks SET status = 'archived' WHERE status = 'active'`);
    }

    // Erstelle neue Woche (ohne subscription_tier in weeks!)
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

    // Speichere Wochentage
    for (const entry of plan.weeklyPlan) {
      await connection.query(
        `INSERT INTO week_days (week_id, day_index, day_label, meal_id, is_completed)
         VALUES (?, ?, ?, ?, FALSE)`,
        [weekId, entry.dayIndex, entry.dayLabel, entry.meal.id]
      );
    }

    // Speichere Einkaufsliste
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

/**
 * getActiveWeek (unverändert, aber ohne subscription_tier aus weeks)
 */
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

  // Hole Subscription-Plan des Users (für Response)
  const subscriptionPlan = userId ? await getUserSubscriptionPlan(userId) : 'FREE';

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
    subscriptionTier: subscriptionPlan, // Vom User, nicht von der Woche!
    weeklyPlan,
    shoppingList,
    summary: {
      totalMeals: weeklyPlan.length,
      totalShoppingItems: shoppingList.length,
      checkedShoppingItems: shoppingList.filter((item) => item.isChecked).length,
      estimatedCookingMinutes: weeklyPlan.reduce((sum, entry) => sum + (entry.meal.cookingTimeMinutes || 0), 0),
    },
  };
};


/**
 * BESTEHEND: updateShoppingItemStatus (unverändert)
 */
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



// Ersetze die EXISTIERENDE clearActiveWeek Funktion mit dieser:
export const clearActiveWeek = async (userId) => {
  // 1. Aktive Woche finden
  const [activeWeeks] = await pool.query(
    `SELECT id FROM weeks WHERE status = 'active' AND user_id = ?`,
    [userId]
  );

  if (!activeWeeks || activeWeeks.length === 0) {
    return { 
      deletedWeeks: 0, 
      deletedShoppingItems: 0,
      deletedDays: 0,
      message: 'Keine aktive Woche gefunden.' 
    };
  }

  const weekId = activeWeeks[0].id;
  let deletedShoppingCount = 0;
  let deletedWeekCount = 0;
  let deletedDaysCount = 0;
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 2. ALLE Einkaufslisten-Items der Woche löschen (hard delete)
    const [shoppingResult] = await connection.query(
      `DELETE FROM shopping_items WHERE week_id = ? AND user_id = ?`,
      [weekId, userId]
    );
    deletedShoppingCount = shoppingResult.affectedRows;
    console.log(`✅ Gelöschte Einkaufsitems: ${deletedShoppingCount}`);
    
    // 3. Wochen-Tage löschen
    const [daysResult] = await connection.query(
      `DELETE FROM week_days WHERE week_id = ?`,
      [weekId]
    );
    deletedDaysCount = daysResult.affectedRows;
    console.log(`✅ Gelöschte Tage: ${deletedDaysCount}`);
    
    // 4. Woche selbst löschen
    const [weekResult] = await connection.query(
      `DELETE FROM weeks WHERE id = ? AND user_id = ?`,
      [weekId, userId]
    );
    deletedWeekCount = weekResult.affectedRows;
    console.log(`✅ Gelöschte Wochen: ${deletedWeekCount}`);
    
    await connection.commit();
    
    return {
      deletedWeeks: deletedWeekCount,
      deletedShoppingItems: deletedShoppingCount,
      deletedDays: deletedDaysCount,
      weekId: weekId,
      message: `Woche mit ${deletedDaysCount} Tagen und ${deletedShoppingCount} Einkaufsitems wurde gelöscht.`
    };
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Fehler beim Zurücksetzen der Woche:', error);
    throw new Error('Wochen-Reset fehlgeschlagen: ' + error.message);
  } finally {
    connection.release();
  }
};
/**
 * BESTEHEND: deleteShoppingItem (unverändert)
 */
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

/**
 * BESTEHEND: updateShoppingItemDetails (unverändert)
 */
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