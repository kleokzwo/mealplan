import { generateWeeklyPlan } from '../services/planService.js';

export const createPlan = async (req, res, next) => {
  try {
    const plan = await generateWeeklyPlan({
      selectedMealIds: req.body.selectedMealIds,
    });

    res.status(200).json({
      message: 'Wochenplan erfolgreich erstellt.',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};
