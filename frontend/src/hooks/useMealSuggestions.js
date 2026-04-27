import { useEffect, useMemo, useState } from 'react';
import { fetchMealSuggestions } from '../api/mealApi';

export const useMealSuggestions = (filters = {}) => {
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const safeFilters = useMemo(() => {
    return {
      householdType: filters?.householdType ?? 'single',
      dietType: filters?.dietType ?? 'all',
      maxCookingTime: filters?.maxCookingTime ?? 30,
      limit: filters?.limit ?? 5,
      refreshKey: filters?.refreshKey ?? 0,
    };
  }, [
    filters?.householdType,
    filters?.dietType,
    filters?.maxCookingTime,
    filters?.limit,
    filters?.refreshKey,
  ]);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetchMealSuggestions(safeFilters);

        // defensive: API kann data oder direkt array zurückgeben
        const data = response?.data ?? response ?? [];
        setMeals(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error('MealSuggestions Error:', err);
        setError('Rezepte konnten nicht geladen werden.');
        setMeals([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [
    safeFilters.householdType,
    safeFilters.dietType,
    safeFilters.maxCookingTime,
    safeFilters.limit,
    safeFilters.refreshKey,
  ]);

  return { meals, isLoading, error };
};