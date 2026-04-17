import SwipeRecipeCard from './SwipeRecipeCard';
import SwipeActionBar from './SwipeActionBar';

function SwipeDeck({ meals, currentIndex, likedCount, targetLikes, onLike, onSkip }) {
  const activeMeal = meals[currentIndex];
  const nextMeal = meals[currentIndex + 1];

  if (!activeMeal) {
    return null;
  }

  return (
    <section className="swipe-flow">
      <div className="swipe-progress card">
        <div className="swipe-progress-row">
          <span>Noch {Math.max(targetLikes - likedCount, 0)} bis zum Wochenplan</span>
          <span>{Math.min(currentIndex + 1, meals.length)} / {meals.length}</span>
        </div>
        <div className="swipe-progress-bar">
          <span style={{ width: `${(likedCount / targetLikes) * 100}%` }} />
        </div>
      </div>

      <div className="deck-stage">
        {nextMeal ? (
          <article className="swipe-card ghost-card" aria-hidden="true">
            <span className="meal-badge">Als Nächstes</span>
            <h3>{nextMeal.title}</h3>
            <p>
              {nextMeal.cookingTimeMinutes} Min. · {nextMeal.difficulty}
            </p>
          </article>
        ) : null}

        <SwipeRecipeCard
          meal={activeMeal}
          onLike={() => onLike(activeMeal)}
          onSkip={() => onSkip(activeMeal)}
        />
      </div>

      <SwipeActionBar
        onLike={() => onLike(activeMeal)}
        onSkip={() => onSkip(activeMeal)}
      />
    </section>
  );
}

export default SwipeDeck;
