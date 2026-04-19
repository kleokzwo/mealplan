import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock3, ChefHat, Users, Tags } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchActiveWeek } from "../api/weekApi";

const detailGradients = [
  "from-orange-200 via-orange-100 to-amber-100",
  "from-lime-200 via-green-100 to-emerald-100",
  "from-sky-200 via-blue-100 to-cyan-100",
  "from-yellow-200 via-amber-100 to-orange-100",
  "from-pink-200 via-rose-100 to-orange-100",
  "from-violet-200 via-fuchsia-100 to-pink-100",
];

function normalizeDays(week) {
  const candidates = [
    week?.days,
    week?.weekDays,
    week?.week_days,
    week?.data?.days,
    week?.data?.weekDays,
    week?.data?.week_days,
  ];

  return candidates.find(Array.isArray) || [];
}

function findRecipeInWeek(days, recipeId) {
  for (const day of days) {
    const candidates = [
      day?.recipe,
      day?.meal,
      day,
      ...(Array.isArray(day?.recipes) ? day.recipes : []),
      ...(Array.isArray(day?.meals) ? day.meals : []),
    ].filter(Boolean);

    const match = candidates.find((item) => String(item?.id) === String(recipeId));
    if (match) {
      return {
        recipe: match,
        day,
      };
    }
  }

  return { recipe: null, day: null };
}

function splitTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean);
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

export default function RecipeDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [recipe, setRecipe] = useState(location.state?.recipe || null);
  const [day, setDay] = useState(location.state?.day || null);
  const [loading, setLoading] = useState(!location.state?.recipe);

  useEffect(() => {
    if (location.state?.recipe) return;

    const loadRecipe = async () => {
      try {
        const week = await fetchActiveWeek();
        const days = normalizeDays(week);
        const found = findRecipeInWeek(days, id);
        setRecipe(found.recipe);
        setDay(found.day);
      } catch (error) {
        console.error("Fehler beim Laden der Rezeptdetails:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id, location.state]);

  const tags = useMemo(() => splitTags(recipe?.tags), [recipe?.tags]);
  const gradient = detailGradients[(Number(id) || 0) % detailGradients.length];

  return (
    <motion.div
      initial={{ x: "100%", opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 34, mass: 0.9 }}
      className="fixed inset-0 z-[70] overflow-y-auto bg-slate-50"
    >
      <div className="mx-auto min-h-screen max-w-md px-4 pt-4 pb-8">
        <div className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${gradient} p-5 shadow-sm`}>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow-sm backdrop-blur"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {day?.dayName ? (
              <div className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
                {day.dayName}
              </div>
            ) : null}
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700/80">
              Rezeptdetails
            </p>
            <h1 className="mt-3 max-w-[260px] text-4xl font-bold leading-tight text-slate-900">
              {loading ? "Lädt..." : recipe?.title || "Rezept nicht gefunden"}
            </h1>
          </div>

          <div className="mt-8 rounded-[28px] bg-white/70 p-5 shadow-sm backdrop-blur">
            {recipe ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs text-slate-500">Kategorie</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {recipe.category || "Gericht"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs text-slate-500">Ernährung</p>
                  <p className="mt-1 text-base font-semibold capitalize text-slate-900">
                    {recipe.dietType || recipe.diet_type || "offen"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    <p className="text-xs">Kochzeit</p>
                  </div>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {recipe.cooking_time_minutes || recipe.cookTime || recipe.cookingTime || "-"} Min.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ChefHat className="h-4 w-4" />
                    <p className="text-xs">Schwierigkeit</p>
                  </div>
                  <p className="mt-1 text-base font-semibold capitalize text-slate-900">
                    {recipe.difficulty || "einfach"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white/80 p-5 text-sm text-slate-600">
                Dieses Rezept konnte in der aktuellen Woche nicht gefunden werden.
              </div>
            )}
          </div>
        </div>

        {recipe ? (
          <div className="mt-5 space-y-4 pb-6">
            <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-500">
                  Passt gut zu
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Familienfreundlich</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {Number(recipe.family_friendly) === 1 ? "Ja" : "Eher nein"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Haushalt</p>
                  <p className="mt-1 text-base font-semibold capitalize text-slate-900">
                    {recipe.household_fit || "alle"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2">
                <Tags className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-500">
                  Tags
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Noch keine Tags vorhanden.</p>
                )}
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-500">
                Kochen
              </p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Schritt-für-Schritt bald hier
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Deine Datenbank hat aktuell noch keine Zutaten und Kochschritte. Sobald diese Felder da sind,
                kann diese Seite direkt erweitert werden — ohne den Slide-Flow nochmal umzubauen.
              </p>
            </section>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
