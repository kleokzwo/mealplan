import { getMealSuggestions, getMealSteps } from '../services/mealService.js';

export const getSuggestions = async (req, res, next) => {
  try {
    const filters = {
      householdType: req.query.householdType || 'familie',
      dietType: req.query.dietType || 'all',
      maxCookingTime: Number(req.query.maxCookingTime || 25),
      user: req.user || null,
    };

    const suggestions = await getMealSuggestions(filters);

    res.status(200).json({
      message: 'Rezeptvorschläge erfolgreich geladen.',
      filters,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};


export const getStepsByMealId = async (req, res, next) => {
  try {
    const steps = await getMealSteps(req.params.id);

    res.status(200).json({
      message: 'Zubereitungsschritte geladen.',
      data: steps,
    });
  } catch (error) {
    next(error);
  }
};
