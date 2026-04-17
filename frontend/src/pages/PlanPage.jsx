import { useEffect, useState } from "react";
import { CalendarDays, ChefHat } from "lucide-react";
import { fetchActiveWeekDays } from "../api/weekApi";

const fallbackDayNames = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

export default function PlanPage() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDays = async () => {
      try {
        const result = await fetchActiveWeekDays();
        setDays(result || []);
      } catch (error) {
        console.error("Fehler beim Laden des Wochenplans:", error);
        setDays([]);
      } finally {
        setLoading(false);
      }
    };

    loadDays();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
      <div className="mx-auto max-w-md">
        <section className="mb-5 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
            Diese Woche
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Dein Wochenplan
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Alle ausgewählten Gerichte für deine aktuelle Woche.
          </p>
        </section>

        {loading ? (
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Wochenplan wird geladen...</p>
          </div>
        ) : days.length === 0 ? (
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-slate-500" />
              <p className="text-base font-semibold text-slate-900">
                Noch kein Wochenplan vorhanden.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {days.map((day, index) => {
              const recipe = day.recipe || day;
              const dayName = day.dayName || fallbackDayNames[index] || `Tag ${index + 1}`;

              return (
                <article
                  key={day.id || recipe.id || `${dayName}-${index}`}
                  className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-500">
                        {dayName}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold leading-tight text-slate-900">
                        {recipe.title}
                      </h2>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {recipe.category || "Gericht"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Zeit</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {recipe.cookTime || recipe.cookingTime || "-"} Min.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Level</p>
                      <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                        {recipe.difficulty || "einfach"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Typ</p>
                      <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                        {recipe.dietType || recipe.type || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <ChefHat className="h-4 w-4" />
                    <span>Geplant für {dayName.toLowerCase()}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}