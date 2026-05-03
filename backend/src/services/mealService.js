import { pool } from '../config/db.js';

const getSuggestionLimitForUser = (user) => {
  const plan = user?.subscription_plan || user?.plan || user?.role;

  const isPremium =
    plan === 'premium' ||
    plan === 'abo' ||
    plan === 'paid' ||
    plan === 'pro';

  return isPremium ? 50 : 10;
};

const normalizeHouseholdType = (householdType) => {
  if (!householdType) return 'familie';

  const value = String(householdType).toLowerCase().trim();

  if (value === 'familie') return 'familie';
  if (value === 'single') return 'single';
  if (value === 'paar') return 'paar';

  return householdType;
};



const normalizeMeal = (row) => ({
  ...row,
  familyFriendly: Boolean(row.familyFriendly),
  tags: row.tags ? row.tags.split(',').map((tag) => tag.trim()) : [],
});

const buildFilterQuery = ({ householdType, dietType, maxCookingTime, limit = 10 }) => {
  let query = `
    SELECT id, title, category, diet_type AS dietType, cooking_time_minutes AS cookingTimeMinutes,
           difficulty, family_friendly AS familyFriendly, household_fit AS householdFit,
           tags, image_url AS imageUrl
    FROM meal_suggestions
    WHERE cooking_time_minutes <= ?
      AND (household_fit = 'all' OR household_fit = ?)
  `;

  const params = [maxCookingTime, householdType];

  if (householdType === 'familie') {
    query += ' AND family_friendly = TRUE';
  }

  if (dietType && dietType !== 'all') {
    query += ' AND diet_type = ?';
    params.push(dietType);
  }

  query += `
    ORDER BY RAND()
    LIMIT ?
  `;

  params.push(limit);

  return { query, params };
};


const scoreMeal = (meal, householdType) => {
  let score = 0;

  if (meal.familyFriendly) {
    score += 3;
  }

  if (meal.householdFit === householdType) {
    score += 4;
  }

  if (meal.cookingTimeMinutes <= 20) {
    score += 3;
  }

  if (meal.difficulty === 'einfach') {
    score += 2;
  }

  if (meal.tags.includes('kinderfreundlich')) {
    score += householdType === 'familie' ? 3 : 1;
  }

  if (meal.tags.includes('ultraschnell')) {
    score += 2;
  }

  return score;
};


const diversifyMeals = (meals, limit) => {
  const selected = [];
  const categoryCounts = new Map();
  const dietCounts = new Map();

  for (const meal of meals) {
    const currentCategoryCount = categoryCounts.get(meal.category) || 0;
    const currentDietCount = dietCounts.get(meal.dietType) || 0;

    const allowCategory = currentCategoryCount < 1 || selected.length >= 3;
    const allowDiet = currentDietCount < 2 || selected.length >= 4;

    if (!allowCategory || !allowDiet) {
      continue;
    }

    selected.push(meal);
    categoryCounts.set(meal.category, currentCategoryCount + 1);
    dietCounts.set(meal.dietType, currentDietCount + 1);

    if (selected.length === limit) {
      break;
    }
  }

  if (selected.length < limit) {
    for (const meal of meals) {
      if (selected.some((entry) => entry.id === meal.id)) {
        continue;
      }
      selected.push(meal);
      if (selected.length === limit) {
        break;
      }
    }
  }

  return selected;
};

export const getMealSuggestions = async ({
  householdType = 'familie',
  dietType = 'all',
  maxCookingTime = 25,
  user = null,
}) => {
  const normalizedHouseholdType = normalizeHouseholdType(householdType);
  const limit = getSuggestionLimitForUser(user);

  const filters = buildFilterQuery({
    householdType: normalizedHouseholdType,
    dietType,
    maxCookingTime,
    limit,
  });

  const [rows] = await pool.query(filters.query, filters.params);
  const normalizedRows = rows.map(normalizeMeal);

  const sorted = normalizedRows
    .map((meal) => ({
      ...meal,
      score: scoreMeal(meal, normalizedHouseholdType),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.cookingTimeMinutes !== b.cookingTimeMinutes) {
        return a.cookingTimeMinutes - b.cookingTimeMinutes;
      }
      return a.title.localeCompare(b.title, 'de');
    });

  return diversifyMeals(sorted, limit);
};

// ✅ nur Erweiterung: bequemer Wrapper für User-Objekte
export const getMealSuggestionsForUser = async (user, options = {}) => {
  return getMealSuggestions({
    householdType: user?.householdType || user?.household_type || 'familie',
    dietType: user?.dietType || user?.diet_type || 'all',
    maxCookingTime: options.maxCookingTime || user?.maxCookingTime || 25,
    limit: options.limit || 5,
  });
};

export const getMealSteps = async (mealId) => {
  const [rows] = await pool.query(
    `
    SELECT step_number AS stepNumber, instruction
    FROM meal_steps
    WHERE meal_id = ?
    ORDER BY step_number ASC
    `,
    [mealId]
  );

  return rows;
};

export const getIngredientsByMealId = async (mealId) => {
  const [rows] = await pool.query(
    `SELECT id, name, amount, category, meal_id AS mealId
     FROM meal_ingredients
     WHERE meal_id = ?
     ORDER BY category ASC, name ASC`,
    [mealId]
  );
  
  return rows;
};