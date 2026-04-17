import { httpClient } from './httpClient';

export const generateWeeklyPlan = async ({ selectedMealIds = [] } = {}) => {
  return httpClient('/plans/generate', {
    method: 'POST',
    body: JSON.stringify({ selectedMealIds }),
  });
};
