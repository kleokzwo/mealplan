import { Router } from 'express';
import { getSuggestions, getStepsByMealId } from '../controllers/mealController.js';

const router = Router();

router.get('/suggestions', getSuggestions);
router.get('/:id/steps', getStepsByMealId);

export default router;
