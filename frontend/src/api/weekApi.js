import httpClient from './httpClient';

const normalizeShoppingItem = (item) => ({
  ...item,
  checked: item.checked ?? item.isChecked ?? false,
  isChecked: item.isChecked ?? item.checked ?? false,
  quantity: item.quantity ?? item.amount ?? '',
  amount:
    item.amount ??
    [item.quantity, item.unit].filter(Boolean).join(' ').trim(),
  unit: item.unit ?? '',
  category: item.category ?? 'Sonstiges',
});

const asArray = (value) => (Array.isArray(value) ? value : []);

const firstArray = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return [];
};

const normalizeRecipe = (item) => {
  if (!item) return null;

  const recipe = item.recipe || item.meal || item.menu || item;

  if (!recipe || typeof recipe !== 'object') return null;

  return {
    ...recipe,
    id:
      recipe.id ??
      recipe.recipeId ??
      recipe.mealId ??
      item.recipeId ??
      item.mealId ??
      item.id,
    title:
      recipe.title ??
      recipe.name ??
      recipe.recipeName ??
      recipe.mealName ??
      'Unbenanntes Gericht',
    category: recipe.category ?? recipe.type ?? 'Gericht',
    cookTime: recipe.cookTime ?? recipe.cookingTime ?? recipe.duration ?? null,
    difficulty: recipe.difficulty ?? 'einfach',
    dietType: recipe.dietType ?? recipe.type ?? null,
  };
};

const normalizeDay = (day, index) => {
  const dayName =
    day?.dayName ??
    day?.name ??
    day?.weekday ??
    day?.label ??
    null;

  const nestedRecipes = firstArray(
    day?.recipes,
    day?.meals,
    day?.items,
    day?.entries,
    day?.plannedMeals
  )
    .map(normalizeRecipe)
    .filter(Boolean);

  const singleRecipe =
    normalizeRecipe(day?.recipe) ||
    normalizeRecipe(day?.meal) ||
    normalizeRecipe(day?.menu);

  return {
    ...day,
    id: day?.id ?? day?.dayId ?? `day-${index}`,
    dayName,
    date: day?.date ?? day?.plannedDate ?? null,
    recipe: singleRecipe ?? nestedRecipes[0] ?? null,
    recipes: nestedRecipes,
  };
};

const normalizeWeek = (week) => {
  const raw = week?.data ?? week ?? {};

  const rawDays = firstArray(
    raw.days,
    raw.weekDays,
    raw.week_days,
    raw.weeklyPlan,
    raw.plan,
    raw.entries,
    raw.items
  );

  const normalizedDays = rawDays.map(normalizeDay).filter(Boolean);

  const rawShoppingItems = firstArray(
    raw.shoppingItems,
    raw.shoppingList,
    raw.shopping_items
  );

  const normalizedMeals = normalizedDays
    .flatMap((day) => {
      if (day.recipe) return [day.recipe];
      return asArray(day.recipes);
    })
    .filter(Boolean);

  return {
    ...raw,
    days: normalizedDays,
    normalizedDays,
    normalizedMeals,
    selectedMealsCount: normalizedMeals.length,
    shoppingItems: rawShoppingItems.map(normalizeShoppingItem),
  };
};

export const fetchActiveWeek = async () => {
  const response = await httpClient('/weeks/active');
  return normalizeWeek(response);
};

export const createActiveWeek = async ({ selectedMealIds = [] } = {}) => {
  const response = await httpClient.post('/weeks', { selectedMealIds });
  return normalizeWeek(response);
};

export async function updateShoppingItem(id, updates) {
  const paths = [
    `/weeks/active/shopping-items/${id}`,
    `/weeks/active/shopping_items/${id}`,
    `/shopping-items/${id}`,
    `/shopping_items/${id}`,
  ];

  const payloads = [
    { checked: updates.checked },
    { isChecked: updates.checked },
  ];

  for (const path of paths) {
    for (const body of payloads) {
      try {
        console.log('TRY UPDATE:', path, body);
        return await httpClient.patch(path, body);
      } catch (err) {
        if (err.status !== 404) {
          throw err;
        }
      }
    }
  }

  throw new Error('Update failed: no valid endpoint');
}

// frontend/src/api/weekApi.js

export const deleteActiveWeek = async () => {
  try {
    // httpClient.delete gibt bereits das geparste JSON zurück, keinen Response-Objekt
    const result = await httpClient.delete('/weeks/active', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    console.log('Delete API response:', result);
    
    // result ist bereits das geparste JSON
    return result.data;
  } catch (error) {
    console.error('API Fehler:', error);
    throw error;
  }
};

export const fetchActiveWeekDays = async () => {
  const week = await fetchActiveWeek();
  return week?.days ?? [];
};

export const fetchActiveShoppingItems = async () => {
  const week = await fetchActiveWeek();
  return week?.shoppingItems ?? [];
};

export async function setShoppingItemChecked({ itemId, checked }) {
  const response = await httpClient.patch(`/weeks/active/shopping-items/${itemId}`, {
    isChecked: checked,
  });

  return response?.data ?? response;
}

export const updateShoppingItemDetails = async (item) => {
  return httpClient.put(`/weeks/active/shopping-items/${item.id}`, {
    name: item.name,
    quantity: item.quantity,
    category: item.category,
  });
};

export async function deleteShoppingItem(itemId) {
  const response = await httpClient.delete(`/weeks/active/shopping-items/${itemId}`);
  return response?.data ?? response;
}