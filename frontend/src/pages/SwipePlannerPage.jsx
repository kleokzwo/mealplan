import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import SwipeRecipeCard from "../components/swipe/SwipeRecipeCard";
import SwipeActionBar from "../components/swipe/SwipeActionBar";
import SwipeSummary from "../components/swipe/SwipeSummary";
import { fetchMealSuggestions } from "../api/mealApi";
import { createActiveWeek } from "../api/weekApi";
import { fetchPreferences } from "../api/preferenceApi";

const SWIPE_THRESHOLD = 110;
const TARGET_LIKES = 7;
const MINIMUM_LIKES = 3;

function extractSuggestions(response) {
  const candidates = [
    response?.data?.meals,
    response?.data?.suggestions,
    response?.data?.data,
    response?.data,
    response?.meals,
    response?.suggestions,
    response,
  ];

  const firstArray = candidates.find((candidate) => Array.isArray(candidate));
  return firstArray || [];
}

export default function SwipePlannerPage() {
  const navigate = useNavigate();

  const [meals, setMeals] = useState([]);
  const [likedMeals, setLikedMeals] = useState([]);
  const [rejectedMeals, setRejectedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingWeek, setCreatingWeek] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [planError, setPlanError] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef(null);
  const [preferences, setPreferences] = useState({
    householdType: "family",
    dietType: "all",
    maxCookingTime: 25,
  });
  const [lastSwipeDirection, setLastSwipeDirection] = useState("like");

  //const x = useMotionValue(0);
  //const rotate = useTransform(x, [-220, 0, 220], [-12, 0, 12]);

  useEffect(() => {
    initPage();

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  async function initPage() {
    try {
      setLoading(true);

      let prefs = {
        householdType: "family",
        dietType: "all",
        maxCookingTime: 25,
      };

      try {
        const result = await fetchPreferences();
        prefs = {
          householdType: result?.householdType || "family",
          dietType: result?.dietType || "all",
          maxCookingTime: result?.maxCookingTime || 25,
        };
      } catch (error) {
        console.warn("Preferences konnten nicht geladen werden.");
      }

      setPreferences(prefs);
      await loadSuggestions(prefs, []);
    } finally {
      setLoading(false);
    }
  }

  async function loadSuggestions(prefs = preferences, excludeIds = []) {
    try {
      const response = await fetchMealSuggestions({
        householdType: prefs.householdType,
        dietType: prefs.dietType,
        maxCookingTime: prefs.maxCookingTime,
        limit: 5,
        excludeIds,
      });

      console.log("fetchMealSuggestions raw response:", response);

      const normalized = extractSuggestions(response);

      console.log("fetchMealSuggestions normalized suggestions:", normalized);
      console.log("fetchMealSuggestions is array:", Array.isArray(normalized));

      setMeals(normalized);
      setShowSummary(false);
      setPlanError(normalized.length === 0 ? "Keine passenden Vorschläge gefunden." : "");
      //x.set(0);
    } catch (error) {
      console.error("Vorschläge konnten nicht geladen werden:", error);
      setMeals([]);
      setShowSummary(false);
      setPlanError("Vorschläge konnten nicht geladen werden.");
    }
  }

  const activeMeal = meals[0] || null;
  const nextMeal = meals[1] || null;

  function handleDecision(type) {
    if (!activeMeal || isTransitioning) return;

    setLastSwipeDirection(type);
    setIsTransitioning(true);
    const nextLikedCount = likedMeals.length + (type === "like" ? 1 : 0);
    const remaining = meals.slice(1);


    //x.set(swipeOutX);

    if (type === "like") {
      setLikedMeals((prev) =>
        prev.some((meal) => meal.id === activeMeal.id) ? prev : [...prev, activeMeal]
      );
    } else {
      setRejectedMeals((prev) =>
        prev.some((meal) => meal.id === activeMeal.id) ? prev : [...prev, activeMeal]
      );
    }

    setMeals(remaining);

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      //x.set(0);
      setIsTransitioning(false);

      if (remaining.length === 0 || nextLikedCount >= TARGET_LIKES) {
        setShowSummary(true);
      }
    }, 240);
  }

  async function handleRefresh() {
    try {
      setLoading(true);
      setPlanError("");

      const excludeIds = [
        ...likedMeals.map((meal) => meal.id),
        ...rejectedMeals.map((meal) => meal.id),
      ];

      setIsTransitioning(false);
      //x.set(0);

      await loadSuggestions(preferences, excludeIds);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestart() {
    try {
      setLoading(true);
      setLikedMeals([]);
      setRejectedMeals([]);
      setPlanError("");
      setShowSummary(false);
      setIsTransitioning(false);
      //x.set(0);

      await loadSuggestions(preferences, []);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateWeek() {
    try {
      setCreatingWeek(true);
      setPlanError("");

      await createActiveWeek({
        selectedMealIds: likedMeals.map((meal) => meal.id),
      });

      navigate("/");
    } catch (error) {
      console.error("Woche konnte nicht erstellt werden:", error);
      setPlanError("Woche konnte nicht erstellt werden.");
    } finally {
      setCreatingWeek(false);
    }
  }

  const progressLabel = useMemo(() => {
    return `${likedMeals.length} von ${TARGET_LIKES} gewählt`;
  }, [likedMeals.length]);

  if (loading && meals.length === 0 && !showSummary) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
        <div className="mx-auto max-w-md rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
            Diese Woche
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Vorschläge werden geladen
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Wir suchen passende Gerichte für euren Alltag.
          </p>
        </div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <SwipeSummary
        likedMeals={likedMeals}
        rejectedMeals={rejectedMeals}
        targetLikes={TARGET_LIKES}
        minimumLikes={MINIMUM_LIKES}
        creatingWeek={creatingWeek}
        planError={planError}
        onRestart={handleRestart}
        onRefresh={handleRefresh}
        onCreateWeek={handleCreateWeek}
      />
    );
  }

  if (!activeMeal) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
        <div className="mx-auto max-w-md space-y-5">
          <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
              Diese Woche
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Keine Karten verfügbar
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              {planError || "Gerade wurden keine passenden Vorschläge gefunden."}
            </p>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="rounded-2xl bg-slate-100 px-4 py-4 text-base font-semibold text-slate-700 transition active:scale-[0.99]"
            >
              Neu laden
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-2xl bg-slate-900 px-4 py-4 text-base font-semibold text-white transition active:scale-[0.99]"
            >
              Andere Vorschläge
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
      <div className="mx-auto max-w-md">
        <section className="mb-5 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
            Diese Woche
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Wähle {TARGET_LIKES} Gerichte in unter 1 Minute
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Swipe nach rechts, wenn es passt. Nach links, wenn nicht.
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">{progressLabel}</span>
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              {likedMeals.length}/{TARGET_LIKES}
            </span>
          </div>
        </section>

<div className="relative h-[520px] overflow-hidden rounded-[32px]">
  {nextMeal && (
    <SwipeRecipeCard
      recipe={nextMeal}
      style={{
        transform: "scale(0.97)",
        opacity: 0.7,
        pointerEvents: "none",
      }}
    />
  )}

<AnimatePresence mode="wait">
  <motion.div
    key={`${activeMeal.id || activeMeal.slug || activeMeal.title || "meal"}-${likedMeals.length + rejectedMeals.length}`}
    initial={{ scale: 0.98, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
       exit={{
      opacity: 0,
      x: lastSwipeDirection === "like" ? 260 : -260,
      y: 48,
      rotate: lastSwipeDirection === "like" ? 10 : -10,
      scale: 0.96,
    }}
    transition={{ duration: 0.26, ease: "easeOut" }}
    className="absolute inset-0 z-10"
    style={{ pointerEvents: isTransitioning ? "none" : "auto" }}
  >
    <SwipeRecipeCard
      recipe={activeMeal}
      dragProps={{
        drag: isTransitioning ? false : "x",
        dragConstraints: { left: 0, right: 0 },
        onDragEnd: (_, info) => {
          if (info.offset.x > SWIPE_THRESHOLD) {
            handleDecision("like");
          } else if (info.offset.x < -SWIPE_THRESHOLD) {
            handleDecision("reject");
          } else {
            setIsTransitioning(false);
          }
        },
      }}
    />
  </motion.div>
</AnimatePresence>
      </div>
        <SwipeActionBar
          onReject={() => handleDecision("reject")}
          onLike={() => handleDecision("like")}
          onRefresh={handleRefresh}
          disableRefresh={loading || isTransitioning}
        />

        {isTransitioning ? (
          <p className="mt-3 text-center text-sm text-slate-400">Nächste Karte…</p>
        ) : null}
      </div>
    </div>
  );
}