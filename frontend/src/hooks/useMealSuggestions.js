import { useEffect, useState } from 'react';
import { fetchMealSuggestions } from '../api/mealApi';

export const useMealSuggestions = (filters) => {
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await fetchMealSuggestions(filters);
        setMeals(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [filters.householdType, filters.dietType, filters.maxCookingTime, filters.limit, filters.refreshKey]);

  return { meals, isLoading, error };
};
