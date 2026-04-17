import { useMemo, useState } from 'react';
import FilterBar from '../components/FilterBar';
import MealCard from '../components/MealCard';
import { useMealSuggestions } from '../hooks/useMealSuggestions';

function DashboardPage() {
  const [filters, setFilters] = useState({
    householdType: 'familie',
    dietType: 'all',
    maxCookingTime: 25,
    limit: 5,
    refreshKey: 0,
  });

  const stableFilters = useMemo(
    () => ({
      householdType: filters.householdType,
      dietType: filters.dietType,
      maxCookingTime: filters.maxCookingTime,
      limit: filters.limit,
      refreshKey: filters.refreshKey,
    }),
    [filters.householdType, filters.dietType, filters.maxCookingTime, filters.limit, filters.refreshKey]
  );

  const { meals, isLoading, error } = useMealSuggestions({
    ...stableFilters,
    refreshKey: filters.refreshKey,
  });

  const handleChange = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleRefresh = () => {
    setFilters((current) => ({
      ...current,
      refreshKey: current.refreshKey + 1,
    }));
  };

  return (
    <main className="page">
      <header className="hero card">
        <p className="eyebrow">Familien-Autopilot</p>
        <h1>Heute 5 passende Rezepte. Weniger denken, schneller essen.</h1>
        <p>
          Der Einstieg für dein neues Produkt: App öffnen, Vorschläge sehen,
          Woche planen.
        </p>
      </header>

      <FilterBar filters={filters} onChange={handleChange} onRefresh={handleRefresh} />

      {isLoading && <p className="status">Rezepte werden geladen…</p>}
      {error && <p className="status error">{error}</p>}

      <section className="meal-grid">
        {!isLoading && !error && meals.map((meal) => <MealCard key={meal.id} meal={meal} />)}
      </section>
    </main>
  );
}

export default DashboardPage;
