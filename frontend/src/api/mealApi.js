import { httpClient } from './httpClient';

export const fetchMealSuggestions = async ({
  householdType = 'familie',
  dietType = 'all',
  maxCookingTime = 25,
  limit = 5,
  refreshKey = 0,
} = {}) => {
  const query = new URLSearchParams({
    householdType,
    dietType,
    maxCookingTime: String(maxCookingTime),
    limit: String(limit),
    refreshKey: String(refreshKey),
  }).toString();

  return httpClient(`/meals/suggestions?${query}`);
};
