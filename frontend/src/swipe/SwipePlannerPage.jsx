import { useEffect, useMemo, useState } from 'react';
import FilterBar from '../components/FilterBar';
import SwipeDeck from './SwipeDeck';
import SwipeSummary from './SwipeSummary';
import { useMealSuggestions } from '../hooks/useMealSuggestions';

const TARGET_LIKES = 5;

function SwipePlannerPage() {
  const [filters, setFilters] = useState({
    householdType: 'familie',
    dietType: 'all',
    maxCookingTime: 25,
    limit: 12,
    refreshKey: 0,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMeals, setLikedMeals] = useState([]);
  const [dismissedMeals, setDismissedMeals] = useState([]);

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

  const { meals, isLoading, error } = useMealSuggestions(stableFilters);

  useEffect(() => {
    setCurrentIndex(0);
    setLikedMeals([]);
    setDismissedMeals([]);
  }, [meals]);

  const hasCompletedSelection = likedMeals.length >= TARGET_LIKES;
  const hasReachedDeckEnd = currentIndex >= meals.length;
  const shouldShowSummary = hasCompletedSelection || (!isLoading && hasReachedDeckEnd);

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

  const moveNext = () => {
    setCurrentIndex((value) => value + 1);
  };

  const handleLike = (meal) => {
    setLikedMeals((current) => {
      if (current.some((entry) => entry.id === meal.id)) {
        return current;
      }
      return [...current, meal];
    });
    moveNext();
  };

  const handleSkip = (meal) => {
    setDismissedMeals((current) => {
      if (current.some((entry) => entry.id === meal.id)) {
        return current;
      }
      return [...current, meal];
    });
    moveNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setLikedMeals([]);
    setDismissedMeals([]);
  };

  return (
    <main className="mobile-page">
      <header className="mobile-hero card">
        <p className="eyebrow">Familien-Autopilot</p>
        <h1>Wähle 5 Gerichte in unter 1 Minute.</h1>
        <p>
          Swipe nach rechts, wenn es passt. Nach links, wenn ihr etwas anderes wollt.
        </p>
      </header>

      <FilterBar filters={filters} onChange={handleChange} onRefresh={handleRefresh} />

      <section className="planner-intro">
        <div>
          <p className="planner-label">Diese Woche</p>
          <h2>{likedMeals.length} von {TARGET_LIKES} Gerichten ausgewählt</h2>
        </div>
        <p className="planner-copy">
          Eine gute Auswahl reicht. Den Wochenplan und die Einkaufsliste baut die App danach.
        </p>
      </section>

      {isLoading && <p className="status">Rezepte werden geladen…</p>}
      {error && <p className="status error">{error}</p>}

      {!isLoading && !error && !shouldShowSummary && (
        <SwipeDeck
          meals={meals}
          currentIndex={currentIndex}
          likedCount={likedMeals.length}
          targetLikes={TARGET_LIKES}
          onLike={handleLike}
          onSkip={handleSkip}
        />
      )}

      {!isLoading && !error && shouldShowSummary && (
        <SwipeSummary
          likedMeals={likedMeals}
          dismissedMeals={dismissedMeals}
          targetLikes={TARGET_LIKES}
          onRestart={handleRestart}
          onRefresh={handleRefresh}
        />
      )}
    </main>
  );
}

export default SwipePlannerPage;
