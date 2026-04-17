import { useNavigate } from "react-router-dom";

export default function SwipeSummary({
  likedMeals = [],
  rejectedMeals = [],
  targetLikes = 5,
  minimumLikes = 3,
  creatingWeek = false,
  planError = "",
  onRestart,
  onRefresh,
  onCreateWeek,
}) {
  const navigate = useNavigate();

  const canCreateWeek = likedMeals.length >= minimumLikes;
  const isReady = likedMeals.length >= targetLikes;
  const remainingMeals = Math.max(minimumLikes - likedMeals.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
      <div className="mx-auto max-w-md space-y-5">
        <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
            Diese Woche
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {isReady
              ? `${likedMeals.length} von ${targetLikes} Gerichten ausgewählt`
              : canCreateWeek
                ? "Genug Auswahl für euren Wochenplan."
                : "Nicht genug passende Gerichte gefunden."}
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {canCreateWeek
              ? "Die App kann aus diesen Likes jetzt direkt Wochenplan und Einkaufsliste bauen."
              : `Wähle noch ${remainingMeals} Gericht${remainingMeals === 1 ? "" : "e"} oder hol dir neue Vorschläge.`}
          </p>

          {planError ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {planError}
            </p>
          ) : null}
        </section>

        <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            Fast geschafft
          </p>

          {likedMeals.length > 0 ? (
            <div className="mt-4 space-y-3">
              {likedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xl font-semibold leading-tight text-slate-900">
                      {meal.title}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {meal.cookingTimeMinutes || meal.cookTime || "-"} Min. ·{" "}
                      {meal.difficulty || "einfach"} ·{" "}
                      {meal.dietType || meal.type || "-"}
                    </p>
                  </div>

                  <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                    Ausgewählt
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Noch keine Gerichte ausgewählt.
            </p>
          )}

          <p className="mt-4 text-sm text-slate-500">
            Übersprungen: {rejectedMeals.length} Vorschläge
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="rounded-2xl bg-slate-100 px-4 py-4 text-base font-semibold text-slate-700 transition active:scale-[0.99]"
          >
            Neu wählen
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="rounded-2xl bg-slate-900 px-4 py-4 text-base font-semibold text-white transition active:scale-[0.99]"
          >
            Neue Vorschläge
          </button>
        </div>

        <button
          type="button"
          onClick={onCreateWeek}
          disabled={!canCreateWeek || creatingWeek}
          className="w-full rounded-2xl bg-indigo-600 px-5 py-4 text-base font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {creatingWeek ? "Woche wird erstellt..." : "Woche erstellen"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base font-semibold text-slate-700 transition active:scale-[0.99]"
        >
          Zurück zu Home
        </button>
      </div>
    </div>
  );
}