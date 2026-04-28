import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import {
  createWeek,
  getCurrentWeek,
  deleteCurrentWeek,
  updateActiveShoppingItem,
  deleteActiveShoppingItem,
  updateActiveShoppingItemDetails,
} from '../controllers/weekController.js';

const router = Router();

router.use(requireAuth);

router.get('/active', getCurrentWeek);
router.patch('/active/shopping-items/:itemId', updateActiveShoppingItem);
router.post('/', createWeek);
router.delete('/active', deleteCurrentWeek);
router.delete('/active/shopping-items/:itemId', deleteActiveShoppingItem);
router.put('/active/shopping-items/:itemId', updateActiveShoppingItemDetails);

export default router;