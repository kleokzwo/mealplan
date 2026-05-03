import { Router } from 'express';
import { getSuggestions, getStepsByMealId, getIngredients } from '../controllers/mealController.js';

const router = Router();

router.get('/suggestions', getSuggestions);
router.get('/:id/steps', getStepsByMealId);
router.get('/:id/ingredients', getIngredients);

export default router;
