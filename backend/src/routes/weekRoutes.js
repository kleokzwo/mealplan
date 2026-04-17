import { Router } from 'express';
import {
  createWeek,
  getCurrentWeek,
  deleteCurrentWeek,
  updateActiveShoppingItem,
} from '../controllers/weekController.js';

const router = Router();

router.get('/active', getCurrentWeek);
router.patch('/active/shopping-items/:itemId', updateActiveShoppingItem);
router.post('/', createWeek);
router.delete('/active', deleteCurrentWeek);

export default router;
