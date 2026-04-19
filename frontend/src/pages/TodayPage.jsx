import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ShoppingCart,
  ChefHat,
  Heart,
  RefreshCw,
  X,
  Clock3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  createActiveWeek,
  deleteActiveWeek,
  fetchActiveWeek,
} from "../api/weekApi";
import { useMealSuggestions } from "../hooks/useMealSuggestions";

function normalizeShoppingItems(week) {
  const candidates = [
    week?.shoppingItems,
    week?.shoppingList,
    week?.shopping_items,
    week?.data?.shoppingItems,
    week?.data?.shoppingList,
    week?.data?.shopping_items,
  ];

  const firstArray = candidates.find((candidate) => Array.isArray(candidate));
  return firstArray || [];
}

function normalizeDays(week) {
  const candidates = [
    week?.days,
    week?.weekDays,
    week?.week_days,
    week?.weeklyPlan,
    week?.plan,
    week?.entries,
    week?.items,
    week?.data?.days,
    week?.data?.weekDays,
    week?.data?.week_days,
    week?.data?.weeklyPlan,
    week?.data?.plan,
    week?.data?.entries,
    week?.data?.items,
  ];

  const firstArray = candidates.find((candidate) => Array.isArray(candidate));
  return firstArray || [];
}

function getMealTitle(meal) {
  return (
    meal?.title ||
    meal?.name ||
    meal?.recipeName ||
    meal?.mealName ||
    meal?.recipe?.title ||
    meal?.meal?.title ||
    "Unbenanntes Rezept"
  );
}

function getMealCategory(meal) {
  return meal?.category || meal?.type || meal?.recipe?.category || "Gericht";
}

function getMealDifficulty(meal) {
  return meal?.difficulty || meal?.recipe?.difficulty || "Einfach";
}

function getMealDiet(meal) {
  return meal?.dietType || meal?.diet_type || meal?.type || meal?.recipe?.dietType || "-";
}

function getMealTime(meal) {
  return (
    meal?.cookTime ||
    meal?.cooking_time_minutes ||
    meal?.cookingTime ||
    meal?.recipe?.cookTime ||
    meal?.recipe?.cooking_time_minutes ||
    null
  );
}

function getMealImage(meal) {
  return meal?.image_url || meal?.imageUrl || meal?.image || meal?.recipe?.image_url || null;
}

function getMealId(meal) {
  return meal?.id ?? meal?.mealId ?? meal?.recipeId ?? meal?.recipe?.id ?? null;
}

function EmptySwipeState({ onWeekCreated }) {
  const navigate = useNavigate();
  const [cardIndex, setCardIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [likedMealIds, setLikedMealIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const swipeThreshold = 110;

  const { meals = [], isLoading, error } = useMealSuggestions({
    householdType: "single",
    dietType: "all",
    maxCookingTime: 30,
    limit: 5,
    refreshKey: 0,
  });

  const deckMeals = meals.slice(0, 5);
  const currentMeal = deckMeals[cardIndex] || null;
  const isDeckFinished = deckMeals.length > 0 && cardIndex >= deckMeals.length;

  const cardVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 320 : -320,
      opacity: 0,
      scale: 0.97,
      rotate: dir > 0 ? 6 : -6,
    }),
    center: {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
    },
    exit: (dir) => ({
      x: dir > 0 ? 460 : -460,
      y: 24,
      opacity: 0,
      rotate: dir > 0 ? 12 : -12,
      transition: { duration: 0.22 },
    }),
  };

  const finishSelection = async (nextLikedIds) => {
    if (nextLikedIds.length < 5 || isSaving) return;

    try {
      setIsSaving(true);
      const createdWeek = await createActiveWeek({ selectedMealIds: nextLikedIds });
      onWeekCreated(createdWeek);
    } catch (saveError) {
      console.error("Aktive Woche konnte nicht erstellt werden:", saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const moveToNextCard = (dir) => {
    setDirection(dir);
    setDragX(0);
    setCardIndex((prev) => prev + 1);
  };

  const handleLike = async () => {
    if (!currentMeal || isSaving) return;

    const mealId = getMealId(currentMeal);
    if (!mealId) {
      moveToNextCard(1);
      return;
    }

    const nextLikedIds = likedMealIds.includes(mealId)
      ? likedMealIds
      : [...likedMealIds, mealId];

    setLikedMealIds(nextLikedIds);

    if (nextLikedIds.length >= 5) {
      setDirection(1);
      await finishSelection(nextLikedIds);
      return;
    }

    moveToNextCard(1);
  };

  const handleReject = () => {
    if (!currentMeal || isSaving) return;
    moveToNextCard(-1);
  };

  const handleRefresh = () => {
    navigate("/swipe");
  };

  const handleDragEnd = async (_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > swipeThreshold || velocity > 500) {
      await handleLike();
      return;
    }

    if (offset < -swipeThreshold || velocity < -500) {
      handleReject();
      return;
    }

    setDragX(0);
  };

  const image = getMealImage(currentMeal);
  const rotation = dragX * 0.04;

  if (isLoading || isSaving) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
        <div className="mx-auto max-w-md rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">
            {isSaving ? "Auswahl wird gespeichert..." : "Rezepte werden geladen..."}
          </p>
        </div>
      </div>
    );
  }

  if (error && !deckMeals.length) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
        <div className="mx-auto max-w-md rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/swipe")}
            className="mt-4 w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white"
          >
            Zum Swipe Planner
          </button>
        </div>
      </div>
    );
  }

  if (isDeckFinished || !currentMeal) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
        <div className="mx-auto max-w-md rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-lg font-semibold text-slate-900">Noch nicht genug Rezepte ausgewählt.</p>
          <p className="mt-2 text-sm text-slate-500">
            Du hast {likedMealIds.length} von 5 Rezepten geliked. Für die Einkaufsliste brauchen wir 5 Menüs.
          </p>
          <button
            type="button"
            onClick={() => navigate("/swipe")}
            className="mt-4 w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white"
          >
            Weitere Rezepte swipen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
      <div className="mx-auto max-w-md">
        <div className="relative h-[560px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${getMealId(currentMeal) || cardIndex}`}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDrag={(_, info) => setDragX(info.offset.x)}
              onDragEnd={handleDragEnd}
              style={{ rotate: `${rotation}deg` }}
              className="absolute inset-0 touch-pan-y"
            >
              <article className="flex h-full flex-col overflow-hidden rounded-[34px] bg-white shadow-[0_16px_60px_rgba(15,23,42,0.10)] ring-1 ring-slate-200">
                <div className="relative h-[360px] w-full overflow-hidden bg-slate-100">
                  {image ? (
                    <img
                      src={image}
                      alt={getMealTitle(currentMeal)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-200 via-rose-100 to-lime-100">
                      <ChefHat className="h-14 w-14 text-slate-700" />
                    </div>
                  )}

                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
                    {getMealCategory(currentMeal)}
                  </div>

                  <div className="absolute right-4 top-4 rounded-full bg-slate-900/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    {likedMealIds.length}/5 gewählt
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold leading-tight text-slate-900">
                        {getMealTitle(currentMeal)}
                      </h1>
                      <p className="mt-2 text-sm text-slate-500">{getMealDiet(currentMeal)}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-orange-50 p-3">
                      <p className="text-xs text-slate-500">Dauer</p>
                      <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Clock3 className="h-4 w-4" />
                        <span>{getMealTime(currentMeal) ? `${getMealTime(currentMeal)} Min.` : "Flexibel"}</span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-lime-50 p-3">
                      <p className="text-xs text-slate-500">Level</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{getMealDifficulty(currentMeal)}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-5 text-center text-sm text-slate-400">
                    Rechts = behalten, links = überspringen
                  </div>
                </div>
              </article>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={handleReject}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200"
            aria-label="Nach links"
          >
            <X className="h-7 w-7" />
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200"
            aria-label="Mehr Rezepte"
          >
            <RefreshCw className="h-7 w-7" />
          </button>
          <button
            type="button"
            onClick={handleLike}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
            aria-label="Rezept behalten"
          >
            <Heart className="h-7 w-7" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const navigate = useNavigate();
  const [week, setWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const loadWeek = async () => {
      try {
        const data = await fetchActiveWeek();
        setWeek(data || null);
      } catch (error) {
        setWeek(null);
      } finally {
        setLoading(false);
      }
    };

    loadWeek();
  }, []);

  const days = normalizeDays(week);
  const shoppingItems = normalizeShoppingItems(week);
  const hasOpenShopping = shoppingItems.some((item) => !(item?.checked ?? item?.isChecked ?? false));
  const hasContent = days.length > 0 || shoppingItems.length > 0;

  const todayMeal = days[0]?.recipe || days[0]?.meal || days[0]?.menu || days[0] || null;

  const checkedItems = shoppingItems.filter(
    (item) => item?.checked ?? item?.isChecked ?? false
  ).length;

  const progressText = useMemo(() => {
    return `${days.length}/${Math.max(days.length, 5)} Tage`;
  }, [days.length]);

  const handleOpenPlanner = () => navigate("/swipe");

  const handleResetWeek = async () => {
    try {
      setResetting(true);
      await deleteActiveWeek();
      setWeek(null);
    } catch (error) {
      console.error("Aktive Woche konnte nicht gelöscht werden:", error);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
        <div className="mx-auto max-w-md rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Lade deinen Tagesüberblick...</p>
        </div>
      </div>
    );
  }

  if (!hasContent) {
    return <EmptySwipeState onWeekCreated={setWeek} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
      <div className="mx-auto max-w-md space-y-5">
        <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">Heute</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">Deine Woche ist bereit.</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">Wenig denken, direkt loslegen.</p>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">Heute zu tun</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Wenig denken, direkt loslegen</h2>
            </div>
            <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">{progressText}</div>
          </div>

          <div className="space-y-3">
            {(shoppingItems.length > 0 || hasOpenShopping) && (
              <button
                type="button"
                onClick={() => navigate("/shopping")}
                className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-slate-500" />
                  <span className="text-lg font-semibold text-slate-900">Einkauf prüfen</span>
                </div>
                <span className="text-base text-slate-500">{checkedItems}/{shoppingItems.length} Artikel erledigt.</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate("/plan")}
              className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <ChefHat className="h-5 w-5 text-slate-500" />
                <span className="text-lg font-semibold text-slate-900">Kochen einplanen</span>
              </div>
              <span className="max-w-[140px] text-right text-base text-slate-500">{getMealTitle(todayMeal)}</span>
            </button>
          </div>
        </section>

        <section onClick={() => navigate("/plan")} className="cursor-pointer rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">Diese Woche</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">Dein Essensplan</h2>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays className="h-4 w-4" />
            <span>{days.length} Gerichte ausgewählt</span>
          </div>
        </section>

        {shoppingItems.length > 0 && (
          <section onClick={() => navigate("/shopping")} className="cursor-pointer rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">Einkauf</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">Die Liste für diese Woche</h2>
              </div>
              <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">{checkedItems}/{shoppingItems.length}</div>
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={handleOpenPlanner}
          className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white shadow-sm transition active:scale-[0.99]"
        >
          Woche weiterplanen
        </button>

        <button
          type="button"
          onClick={handleResetWeek}
          disabled={resetting}
          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base font-semibold text-slate-700 shadow-sm disabled:opacity-60"
        >
          {resetting ? "Wird zurückgesetzt..." : "Woche zurücksetzen"}
        </button>
      </div>
    </div>
  );
}
