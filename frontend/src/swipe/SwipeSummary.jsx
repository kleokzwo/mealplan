function SwipeSummary({ likedMeals, dismissedMeals, targetLikes, onRestart, onRefresh }) {
  const isReady = likedMeals.length >= targetLikes;

  return (
    <section className="card summary-card">
      <p className="eyebrow">{isReady ? 'Woche bereit' : 'Fast geschafft'}</p>
      <h2>
        {isReady
          ? 'Dein Wochenplan kann jetzt erstellt werden.'
          : 'Nicht genug passende Gerichte gefunden.'}
      </h2>
      <p>
        {isReady
          ? 'Diese Auswahl kannst du als Nächstes in Wochenplan, Einkaufsliste und Aufgaben umwandeln.'
          : 'Hol dir neue Vorschläge oder starte die Auswahl noch einmal neu.'}
      </p>

      <div className="summary-list">
        {likedMeals.map((meal) => (
          <article key={meal.id} className="summary-item">
            <div>
              <strong>{meal.title}</strong>
              <p>{meal.cookingTimeMinutes} Min. · {meal.difficulty} · {meal.dietType}</p>
            </div>
            <span className="summary-tag">Ausgewählt</span>
          </article>
        ))}
      </div>

      {dismissedMeals.length > 0 ? (
        <p className="summary-footnote">
          Übersprungen: {dismissedMeals.length} Vorschläge
        </p>
      ) : null}

      <div className="summary-actions">
        <button type="button" className="action-button secondary" onClick={onRestart}>
          Neu wählen
        </button>
        <button type="button" className="action-button primary" onClick={onRefresh}>
          Neue Vorschläge
        </button>
      </div>
    </section>
  );
}

export default SwipeSummary;