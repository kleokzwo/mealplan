function FilterBar({ filters, onChange, onRefresh }) {
  return (
    <section className="card filter-sheet">
      <div className="filter-sheet-header">
        <div>
          <p className="planner-label">Schnell filtern</p>
          <h2>Passende Vorschläge in Sekunden</h2>
        </div>
        <button type="button" className="refresh-button" onClick={onRefresh}>
          Neu mischen
        </button>
      </div>

      <div className="filter-stack">
        <label>
          <span>Haushalt</span>
          <select
            value={filters.householdType}
            onChange={(event) => onChange('householdType', event.target.value)}
          >
            <option value="single">Single</option>
            <option value="paar">Paar</option>
            <option value="familie">Familie</option>
          </select>
        </label>

        <label>
          <span>Ernährung</span>
          <select
            value={filters.dietType}
            onChange={(event) => onChange('dietType', event.target.value)}
          >
            <option value="all">Alles</option>
            <option value="omnivore">Mit Fleisch</option>
            <option value="vegetarisch">Vegetarisch</option>
            <option value="vegan">Vegan</option>
            <option value="fisch">Fisch</option>
          </select>
        </label>

        <label>
          <span>Max. Kochzeit</span>
          <select
            value={filters.maxCookingTime}
            onChange={(event) => onChange('maxCookingTime', Number(event.target.value))}
          >
            <option value={15}>15 Min.</option>
            <option value={20}>20 Min.</option>
            <option value={25}>25 Min.</option>
            <option value={30}>30 Min.</option>
          </select>
        </label>
      </div>
    </section>
  );
}

export default FilterBar;
