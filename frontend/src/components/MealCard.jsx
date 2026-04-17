function MealCard({ meal }) {
  return (
    <article className="card meal-card">
      <span className="pill">{meal.category}</span>
      <h3>{meal.title}</h3>
      <p>{meal.cookingTimeMinutes} Min. · {meal.difficulty}</p>
      <p>Typ: {meal.dietType}</p>
      <div className="meal-actions">
        <button type="button">Gefällt mir</button>
        <button type="button" className="secondary">Anderes Rezept</button>
      </div>
    </article>
  );
}

export default MealCard;
