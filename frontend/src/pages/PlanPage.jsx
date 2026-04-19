import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchActiveWeek } from "../api/weekApi";

const fallbackDayNames = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

const gradients = [
  "from-orange-200 to-orange-300",
  "from-green-200 to-green-300",
  "from-blue-200 to-blue-300",
  "from-yellow-200 to-yellow-300",
  "from-teal-200 to-teal-300",
  "from-pink-200 to-pink-300",
];

export default function PlanPage() {
  const navigate = useNavigate();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchActiveWeek();
        console.log("PLAN WEEK:", result);
        const normalizedDays = Array.isArray(result?.days) ? result.days : [];
        setDays(normalizedDays);
      } catch (err) {
        console.error(err);
        setDays([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const selectedMealsCount = days.filter((d) => d?.recipe || d?.recipes?.length).length;

  const openRecipe = (recipe, day) => {
    if (!recipe?.id) return;
    navigate(`/recipe/${recipe.id}`, {
      state: {
        recipe,
        day,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
      <div className="mx-auto max-w-md">
        <section className="mb-5 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
            Diese Woche
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-900">Dein Wochenplan</h1>

          <div className="mt-4 rounded-full bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700">
            {selectedMealsCount} Gerichte eingeplant
          </div>
        </section>

        {loading ? (
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Wochenplan wird geladen...</p>
          </div>
        ) : days.length === 0 ? (
          <div className="flex items-center gap-3 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <CalendarDays className="h-5 w-5 text-slate-500" />
            <p className="text-base font-semibold text-slate-900">Noch kein Wochenplan vorhanden</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {days.map((day, index) => {
              const recipe = day.recipe || day.recipes?.[0] || null;
              const dayName = day.dayName || fallbackDayNames[index] || `Tag ${index + 1}`;
              const gradient = gradients[index % gradients.length];

              return (
                <button
                  key={day.id || index}
                  type="button"
                  onClick={() => openRecipe(recipe, day)}
                  disabled={!recipe}
                  className={`relative rounded-[24px] bg-gradient-to-br ${gradient} p-4 text-left text-slate-900 shadow-sm transition active:scale-[0.98] ${
                    recipe ? "cursor-pointer" : "cursor-default opacity-70"
                  }`}
                >
                  <p className="text-sm font-semibold">{dayName}</p>

                  {recipe ? (
                    <>
                      <h3 className="mt-2 text-lg font-bold leading-tight">{recipe.title}</h3>
                      <div className="mt-2 inline-block rounded-full bg-white/60 px-2 py-1 text-xs">
                        {recipe.category || "Gericht"}
                      </div>
                      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700/70">
                        Antippen für Details
                      </p>
                    </>
                  ) : (
                    <div className="mt-4 text-sm text-slate-600">Kein Gericht</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
