import { getMealSuggestions } from '../services/mealService.js';

export const getSuggestions = async (req, res, next) => {
  try {
    const filters = {
      householdType: req.query.householdType || 'familie',
      dietType: req.query.dietType || 'all',
      maxCookingTime: Number(req.query.maxCookingTime || 25),
      limit: Number(req.query.limit || 5),
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
