import { Router } from 'express';
import { getAppPreferences, updateAppPreferences } from '../controllers/preferenceController.js';

const router = Router();

router.get('/', getAppPreferences);
router.put('/', updateAppPreferences);

export default router;
