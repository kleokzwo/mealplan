import { Router } from 'express';
import { getSuggestions } from '../controllers/mealController.js';

const router = Router();

router.get('/suggestions', getSuggestions);

export default router;
