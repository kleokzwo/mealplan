import {
  getOrCreateSuggestionsForActiveWeek,
  setWeekMealSuggestionStatus,
} from "../services/weekMealSuggestionService.js";
import { getUserById } from "../services/userService.js";

export async function getActiveWeekMealSuggestions(req, res) {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User nicht gefunden",
      });
    }

    const result = await getOrCreateSuggestionsForActiveWeek(user);

    return res.json({
      success: true,
      week: result.week,
      suggestions: result.suggestions,
      created: result.created,
    });
  } catch (error) {
    console.error("Fehler beim Laden der Meal Suggestions:", error);

    if (error.message === "Keine aktive Woche gefunden") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Interner Serverfehler",
    });
  }
}

export async function patchWeekMealSuggestionStatus(req, res) {
  try {
    const { status } = req.body;
    const suggestionId = Number(req.params.id);

    if (!Number.isInteger(suggestionId) || suggestionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Ungültige Suggestion-ID",
      });
    }

    const allowedStatuses = ["pending", "selected", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Ungültiger Status",
      });
    }

    await setWeekMealSuggestionStatus(req.user.id, suggestionId, status);

    return res.json({
      success: true,
      message: "Status aktualisiert",
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Suggestion-Status:", error);

    if (
      error.message === "Vorschlag nicht gefunden" ||
      error.message === "Kein Zugriff auf diesen Vorschlag"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Status konnte nicht aktualisiert werden",
    });
  }
}