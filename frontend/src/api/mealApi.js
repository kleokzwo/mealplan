import { httpClient } from './httpClient';


export const fetchMealSuggestions = async ({
  householdType = 'familie',
  dietType = 'all',
  maxCookingTime = 25,
  limit = 5,
  refreshKey = 0,
  excludeIds = [],
} = {}) => {
  const query = new URLSearchParams({
    householdType,
    dietType,
    maxCookingTime: String(maxCookingTime),
    limit: String(limit),
    refreshKey: String(refreshKey),
  });

  if (excludeIds.length > 0) {
    query.set('excludeIds', excludeIds.join(','));
  }

  return httpClient.get(`/meals/suggestions?${query.toString()}`);
};

// neue Phase-2/3 APIs – noch nicht an die alte Swipe-Seite gehängt
export const fetchActiveWeekSuggestions = async () => {
  return httpClient.get("/meal-suggestions/active-week");
};

export const updateMealSuggestionStatus = async (id, status) => {
  return httpClient.patch(`/meal-suggestions/${id}/status`, { status });
};
