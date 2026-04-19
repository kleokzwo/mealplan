import { getMealSuggestionsForUser } from "./mealService.js";
import {
  getActiveWeekForUser,
  getWeekMealSuggestionsByWeekId,
  createWeekMealSuggestion,
  getWeekMealSuggestionById,
  getWeekMealSuggestionByWeekAndMeal,
  updateWeekMealSuggestionStatus,
} from "../config/queries.js";

export async function getOrCreateSuggestionsForActiveWeek(user) {
  const activeWeek = await getActiveWeekForUser(user.id);

  if (!activeWeek) {
    throw new Error("Keine aktive Woche gefunden");
  }

  const existingSuggestions = await getWeekMealSuggestionsByWeekId(activeWeek.id);

  if (existingSuggestions.length > 0) {
    return {
      week: activeWeek,
      suggestions: existingSuggestions,
      created: false,
    };
  }

  const suggestedMeals = await getMealSuggestionsForUser(user, { limit: 5 });

  for (const meal of suggestedMeals) {
    const existingWeekMeal = await getWeekMealSuggestionByWeekAndMeal(
      activeWeek.id,
      meal.id
    );

    if (!existingWeekMeal) {
      await createWeekMealSuggestion(activeWeek.id, meal.id, "pending");
    }
  }

  const savedSuggestions = await getWeekMealSuggestionsByWeekId(activeWeek.id);

  return {
    week: activeWeek,
    suggestions: savedSuggestions,
    created: true,
  };
}

export async function setWeekMealSuggestionStatus(userId, suggestionId, status) {
  const allowedStatuses = ["pending", "selected", "rejected"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Ungültiger Status");
  }

  const suggestion = await getWeekMealSuggestionById(suggestionId);

  if (!suggestion) {
    throw new Error("Vorschlag nicht gefunden");
  }

  if (Number(suggestion.user_id) !== Number(userId)) {
    throw new Error("Kein Zugriff auf diesen Vorschlag");
  }

  const updated = await updateWeekMealSuggestionStatus(suggestionId, status);

  if (!updated) {
    throw new Error("Status konnte nicht aktualisiert werden");
  }

  return true;
}