// frontend/src/pages/RecipeDetailPage.jsx

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock3, ChefHat, Users, Tags, ShoppingBasket, Scale } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchActiveWeek } from "../api/weekApi";
import { fetchMealSteps, fetchMealIngredients } from "../api/mealApi";

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

function groupIngredientsByCategory(ingredients) {
  if (!ingredients || ingredients.length === 0) return {};
  
  return ingredients.reduce((acc, ingredient) => {
    const category = ingredient.category || "Zutaten";
    if (!acc[category]) acc[category] = [];
    acc[category].push(ingredient);
    return acc;
  }, {});
}

export default function RecipeDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [recipe, setRecipe] = useState(location.state?.recipe || null);
  const [day, setDay] = useState(location.state?.day || null);
  const [loading, setLoading] = useState(!location.state?.recipe);
  const [steps, setSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);

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

  useEffect(() => {
    if (!id) return;

    const loadSteps = async () => {
      try {
        setStepsLoading(true);
        const response = await fetchMealSteps(id);
        setSteps(response?.data || []);
      } catch (error) {
        console.error("Fehler beim Laden der Zubereitungsschritte:", error);
        setSteps([]);
      } finally {
        setStepsLoading(false);
      }
    };

    loadSteps();
  }, [id]);

  // NEU: Zutaten laden
  useEffect(() => {
    if (!id) return;

  // In RecipeDetailPage.jsx, die loadIngredients Funktion:

  const loadIngredients = async () => {
    try {
      setIngredientsLoading(true);
      const response = await fetchMealIngredients(id);
      // PROBLEM: response ist bereits das Array, nicht { data: [...] }
      setIngredients(response || []);  // ← Ändere von response?.data zu response
    } catch (error) {
      console.error("Fehler beim Laden der Zutaten:", error);
      setIngredients([]);
    } finally {
      setIngredientsLoading(false);
    }
  };

    loadIngredients();
  }, [id]);

  const tags = useMemo(() => splitTags(recipe?.tags), [recipe?.tags]);
  const groupedIngredients = useMemo(() => groupIngredientsByCategory(ingredients), [ingredients]);
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
            {/* ==================== NEU: ZUTATEN SECTION ==================== */}
            <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingBasket className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-500">
                  Zutaten
                </p>
              </div>

              <div className="mt-4 space-y-4">
                {ingredientsLoading ? (
                  <p className="text-sm text-slate-500">Zutaten werden geladen...</p>
                ) : ingredients.length > 0 ? (
                  Object.entries(groupedIngredients).map(([category, categoryIngredients]) => (
                    <div key={category}>
                      <h3 className="text-sm font-bold text-slate-700 mb-2">{category}</h3>
                      <div className="space-y-2">
                        {categoryIngredients.map((ingredient, idx) => (
                          <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <Scale className="h-3 w-3 text-slate-400" />
                              <span className="text-sm text-slate-700">{ingredient.name}</span>
                            </div>
                            <span className="text-sm font-medium text-slate-900">
                              {ingredient.amount || ingredient.quantity || ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Keine Zutaten für dieses Rezept vorhanden.
                  </p>
                )}
              </div>
            </section>

            {/* PASST GUT ZU Section */}
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

            {/* TAGS Section */}
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

            {/* ZUBEREITUNG Section */}
            <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-500">
                Zubereitung
              </p>

              <div className="mt-4 space-y-4">
                {stepsLoading ? (
                  <p className="text-sm text-slate-500">Schritte werden geladen...</p>
                ) : steps.length > 0 ? (
                  steps.map((step) => (
                    <div key={step.stepNumber} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm font-bold text-slate-900">
                        Schritt {step.stepNumber}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {step.instruction}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Noch keine Zubereitungsschritte vorhanden.
                  </p>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}