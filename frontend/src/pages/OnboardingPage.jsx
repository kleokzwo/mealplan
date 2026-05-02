import { useState } from 'react';

const DEFAULTS = {
  householdType: 'familie',
  dietType: 'all',
  maxCookingTime: 25,
};

function OnboardingPage({ initialPreferences, onContinue, isSaving }) {
  const [form, setForm] = useState({
    ...DEFAULTS,
    ...(initialPreferences || {}),
  });

  const handleChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onContinue?.({
      ...form,
      onboarded: true,
    });
  };

  return (
    <main className="mobile-page onboarding-shell">
      <section className="card onboarding-card">
        <p className="eyebrow">Los geht's</p>
        <h1>Einmal kurz einstellen. Danach plant die App fast alles für dich.</h1>
        <p className="planner-copy">
          Sag uns nur, für wen gekocht wird und wie schnell es gehen soll.
        </p>

        <form className="filter-stack" onSubmit={handleSubmit}>
          <label>
            <span>Für wen kochst du meistens?</span>
            <select
              data-testid="onboarding-household-type"
              value={form.householdType}
              onChange={(event) => handleChange('householdType', event.target.value)}
            >
              <option value="single">Single</option>
              <option value="paar">Paar</option>
              <option value="familie">Familie</option>
            </select>
          </label>

          <label>
            <span>Wie esst ihr?</span>
            <select
              data-testid="onboarding-diet-type"
              value={form.dietType}
              onChange={(event) => handleChange('dietType', event.target.value)}
            >
              <option value="all">Alles</option>
              <option value="omnivore">Mit Fleisch</option>
              <option value="vegetarisch">Vegetarisch</option>
              <option value="vegan">Vegan</option>
              <option value="fisch">Fisch</option>
            </select>
          </label>

          <label>
            <span>Wie schnell soll es gehen?</span>
            <select
              data-testid="onboarding-max-cooking-time"
              value={form.maxCookingTime}
              onChange={(event) => handleChange('maxCookingTime', Number(event.target.value))}
            >
              <option value={15}>15 Minuten</option>
              <option value={20}>20 Minuten</option>
              <option value={25}>25 Minuten</option>
              <option value={30}>30 Minuten</option>
              <option value={35}>35 Minuten</option>
            </select>
          </label>

          <button data-testid="onboarding-submit" type="submit" className="action-button primary full-width" disabled={isSaving}>
            {isSaving ? 'Wird gespeichert…' : 'Vorschläge starten'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default OnboardingPage;
