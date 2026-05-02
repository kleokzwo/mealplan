// frontend/src/pages/TodayPage.jsx

import { useEffect, useMemo, useState, useRef } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { ChefHat, Heart, RefreshCw, RotateCcw, ShoppingCart, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createActiveWeek, deleteActiveWeek, fetchActiveWeek } from '../api/weekApi';
import { useMealSuggestions } from '../hooks/useMealSuggestions';

const SWIPE_THRESHOLD = 110;
const VELOCITY_THRESHOLD = 650;
const MIN_SELECTIONS = 3;
const TARGET_SELECTIONS = 7;

const normalizeDays = (week) => {
  if (!week) return [];
  const raw = week?.data ?? week;
  const candidates = [
    raw?.days,
    raw?.weekDays,
    raw?.week_days,
    raw?.weeklyPlan,
    raw?.plan,
    raw?.entries,
    raw?.items,
  ];
  return candidates.find(Array.isArray) ?? [];
};

const normalizeShopping = (week) => {
  if (!week) return [];
  const raw = week?.data ?? week;
  const candidates = [raw?.shoppingItems, raw?.shoppingList, raw?.shopping_items];
  const items = candidates.find(Array.isArray) ?? [];
  return items.map((item) => ({
    ...item,
    isChecked: item?.isChecked ?? item?.checked ?? false,
    checked: item?.checked ?? item?.isChecked ?? false,
  }));
};

const getMealFromDay = (day) =>
  day?.recipe ?? day?.meal ?? day?.menu ?? day?.recipes?.[0] ?? day?.meals?.[0] ?? null;

const getMealId = (meal) => meal?.id ?? meal?.mealId ?? meal?.recipeId ?? null;
const getMealTitle = (meal) => meal?.title ?? meal?.name ?? meal?.mealName ?? meal?.recipeName ?? 'Rezept';
const getMealCategory = (meal) => meal?.category ?? meal?.type ?? 'Gericht';
const getMealDifficulty = (meal) => meal?.difficulty ?? 'einfach';
const getMealType = (meal) => meal?.dietType ?? meal?.diet_type ?? meal?.type ?? '—';
const getMealTime = (meal) => meal?.cookTime ?? meal?.cooking_time_minutes ?? meal?.cookingTime ?? null;
const getMealImage = (meal) => meal?.image_url ?? meal?.imageUrl ?? meal?.image ?? null;

const reasonsForMeal = (meal) => {
  const out = [];
  const time = getMealTime(meal);
  if (time && Number.isFinite(Number(time))) out.push('Schnell genug für euren Alltag');
  if (meal?.family_friendly || meal?.familyFriendly) out.push('Familienfreundlich');
  out.push('Passt zu euren Präferenzen');
  out.push('Gut für den Wochenplan');
  return out.slice(0, 2);
};

function MetricPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/88 px-3 py-2 shadow-[0_4px_14px_rgba(15,23,42,0.04)]">
      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-[14px] font-semibold text-slate-900">{value}</p>
    </div>
  );
}

// frontend/src/pages/TodayPage.jsx

// Ersetze die KOMPLETTE EmptySwipeState Funktion mit dieser:

function EmptySwipeState({ onWeekCreated }) {
  const [meals, setMeals] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMealIds, setLikedMealIds] = useState([]);
  const [creating, setCreating] = useState(false);
  const [localError, setLocalError] = useState('');
  const [batch, setBatch] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation refs
  const [exitX, setExitX] = useState(0);
  const cardRef = useRef(null);
  
  const { meals: suggestedMeals, isLoading: mealsLoading, error } = useMealSuggestions({
    householdType: 'single',
    dietType: 'all',
    maxCookingTime: 30,
    limit: 7,
    refreshKey: batch,
  });

  // Lade Meals
  useEffect(() => {
    if (suggestedMeals && suggestedMeals.length > 0) {
      setMeals(suggestedMeals.filter(Boolean));
      setIsLoading(false);
    } else if (!mealsLoading) {
      setIsLoading(false);
    }
  }, [suggestedMeals, mealsLoading]);

  // Aktuelle Karte
  const currentMeal = meals[currentIndex];
  const selectedCount = likedMealIds.length;

  // Nächsten Batch laden
  const loadNextBatch = () => {
    setBatch(prev => prev + 1);
    setCurrentIndex(0);
    setExitX(0);
  };

  // LIKE (nach rechts swipen)
  const handleLike = async () => {
    if (!currentMeal || creating) return;
    
    const mealId = getMealId(currentMeal);
    if (mealId && !likedMealIds.includes(mealId)) {
      const newLikedIds = [...likedMealIds, mealId];
      setLikedMealIds(newLikedIds);
      
      // Animation nach rechts
      setExitX(500);
      
      // Kurze Verzögerung für die Animation
      setTimeout(() => {
        if (currentIndex + 1 >= meals.length) {
          if (newLikedIds.length >= TARGET_SELECTIONS) {
            finishWeek(newLikedIds);
          } else if (newLikedIds.length >= MIN_SELECTIONS) {
            finishWeek(newLikedIds);
          } else {
            loadNextBatch();
          }
        } else {
          setCurrentIndex(prev => prev + 1);
          setExitX(0);
        }
      }, 200);
    }
  };

  // UNLIKE (nach links swipen)
  const handleReject = () => {
    if (!currentMeal || creating) return;
    
    // Animation nach links
    setExitX(-500);
    
    setTimeout(() => {
      if (currentIndex + 1 >= meals.length) {
        if (likedMealIds.length >= MIN_SELECTIONS) {
          finishWeek(likedMealIds);
        } else {
          loadNextBatch();
        }
      } else {
        setCurrentIndex(prev => prev + 1);
        setExitX(0);
      }
    }, 200);
  };

  // Woche speichern
  const finishWeek = async (mealIds) => {
    if (creating || !mealIds.length || mealIds.length < MIN_SELECTIONS) {
      if (mealIds.length < MIN_SELECTIONS) {
        setLocalError(`Bitte wähle mindestens ${MIN_SELECTIONS} Gerichte aus.`);
      }
      return;
    }

    try {
      setCreating(true);
      setLocalError('');
      await createActiveWeek({ selectedMealIds: mealIds });
      await onWeekCreated?.();
    } catch (err) {
      console.error('Fehler beim Erstellen der Woche:', err);
      setLocalError('Die Woche konnte gerade nicht erstellt werden.');
      setCreating(false);
    }
  };

  // Drag Ende Handler für flüssiges Swipen
  const handleDragEnd = (event, info) => {
    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;
    
    // Schwellwert für Swipe
    if (offsetX > 100 || velocityX > 500) {
      handleLike();
    } else if (offsetX < -100 || velocityX < -500) {
      handleReject();
    } else {
      // Zurück zur Mitte animieren
      setExitX(0);
    }
  };

  // Loading State
  if (isLoading || mealsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500">Lade Vorschläge...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && (!meals || meals.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
        <div className="mx-auto max-w-md rounded-[30px] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80">
          <h2 className="text-2xl font-bold text-slate-900">Vorschläge konnten nicht geladen werden.</h2>
          <button
            type="button"
            onClick={loadNextBatch}
            className="mt-5 w-full rounded-[22px] bg-slate-950 px-5 py-4 text-base font-semibold text-white"
          >
            Nochmal versuchen
          </button>
        </div>
      </div>
    );
  }

  // Keine Karte mehr aber genug Auswahl
  if (!currentMeal && likedMealIds.length >= MIN_SELECTIONS) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
        <div className="mx-auto max-w-md rounded-[30px] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">Fast fertig</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Auswahl speichern?</h2>
          <p className="mt-3 text-base leading-7 text-slate-500">
            {likedMealIds.length} Gerichte sind ausgewählt. Du kannst jetzt speichern oder noch weiter suchen.
          </p>
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => finishWeek(likedMealIds)}
              disabled={creating}
              className="w-full rounded-[22px] bg-slate-950 px-5 py-4 text-base font-semibold text-white disabled:opacity-60"
            >
              {creating ? 'Wird gespeichert...' : 'Auswahl speichern'}
            </button>
            <button
              type="button"
              onClick={loadNextBatch}
              disabled={creating}
              className="w-full rounded-[22px] bg-white px-5 py-4 text-base font-semibold text-slate-700 ring-1 ring-slate-200 disabled:opacity-60"
            >
              5 weitere Vorschläge
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Keine Karte mehr und nicht genug Auswahl
  if (!currentMeal && likedMealIds.length < MIN_SELECTIONS) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
        <div className="mx-auto max-w-md rounded-[30px] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">Weiter auswählen</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Noch nicht genug dabei.</h2>
          <p className="mt-3 text-base leading-7 text-slate-500">
            Du hast bisher {likedMealIds.length} von mindestens {MIN_SELECTIONS} Gerichten ausgewählt.
          </p>
          <button
            type="button"
            onClick={loadNextBatch}
            className="mt-6 w-full rounded-[22px] bg-slate-950 px-5 py-4 text-base font-semibold text-white"
          >
            5 neue Vorschläge
          </button>
        </div>
      </div>
    );
  }

  const image = getMealImage(currentMeal);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-5 pb-28">
      <div className="mx-auto max-w-md">
        {/* Fortschrittsanzeige */}
        <div className="mb-3 flex items-center justify-between px-1 text-sm font-semibold text-slate-500">
          <span>{selectedCount}/{TARGET_SELECTIONS} gewählt</span>
          <span>mind. {MIN_SELECTIONS}</span>
        </div>

        {/* Swipe Card Container */}
        <div className="relative h-[520px] w-full">
          <motion.div
            key={currentMeal.id || currentIndex}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            animate={{ x: exitX }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute w-full cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'pan-y' }}
          >
            <div className="relative overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,#f7f3ff_0%,#f8f8fb_42%,#ffffff_100%)] px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.09)] ring-1 ring-slate-200/70">
              
              {/* Like/Dislike Overlays während des Swipens */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center rounded-[34px] pointer-events-none z-10"
                style={{
                  background: "linear-gradient(135deg, rgba(34,197,94,0.9) 0%, rgba(16,185,129,0.8) 100%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: exitX > 100 ? 0.8 : 0,
                  x: exitX > 100 ? 0 : -100
                }}
                transition={{ duration: 0.1 }}
              >
                <Heart className="w-20 h-20 text-white fill-white" />
              </motion.div>
              
              <motion.div
                className="absolute inset-0 flex items-center justify-center rounded-[34px] pointer-events-none z-10"
                style={{
                  background: "linear-gradient(135deg, rgba(239,68,68,0.9) 0%, rgba(220,38,38,0.8) 100%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: exitX < -100 ? 0.8 : 0,
                  x: exitX < -100 ? 0 : 100
                }}
                transition={{ duration: 0.1 }}
              >
                <X className="w-20 h-20 text-white" />
              </motion.div>

              {/* Bild */}
              {image ? (
                <div className="mb-4 h-[140px] overflow-hidden rounded-[24px] bg-slate-200">
                  <img src={image} alt={getMealTitle(currentMeal)} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="mb-4 h-[140px] rounded-[24px] bg-[linear-gradient(135deg,#d8ccff_0%,#f6ebff_45%,#ffeccf_100%)]" />
              )}

              {/* Inhalt */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-500">Vorschlag</p>
                  <h1 className="mt-3 max-w-[220px] text-[22px] font-bold leading-tight text-slate-900">
                    {getMealTitle(currentMeal)}
                  </h1>
                </div>
                <span className="mt-8 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">
                  {getMealCategory(currentMeal)}
                </span>
              </div>

              {/* Metriken */}
              <div className="mt-5 grid grid-cols-3 gap-2.5">
                <MetricPill
                  label="Zeit"
                  value={getMealTime(currentMeal) ? `${getMealTime(currentMeal)} Min.` : '- Min.'}
                />
                <MetricPill label="Level" value={getMealDifficulty(currentMeal)} />
                <MetricPill label="Typ" value={getMealType(currentMeal)} />
              </div>

              {/* Beschreibung */}
              <div className="mt-5">
                <h2 className="text-[18px] font-bold text-slate-900">Warum das passt</h2>
                <ul className="mt-3 space-y-3 text-[15px] leading-7 text-slate-500">
                  {reasonsForMeal(currentMeal).map((reason) => (
                    <li key={reason}>• {reason}</li>
                  ))}
                </ul>
              </div>

              <p className="mt-5 text-xs text-slate-400 text-center">
                ← Links swipen | Rechts swipen →
              </p>
            </div>
          </motion.div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleReject}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-500 shadow-[0_8px_22px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 active:scale-95 transition-transform"
            aria-label="Ablehnen"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={loadNextBatch}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-500 shadow-[0_8px_22px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 active:scale-95 transition-transform"
            aria-label="Neue Vorschläge laden"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleLike}
            disabled={creating}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white shadow-[0_12px_30px_rgba(244,63,94,0.30)] active:scale-95 transition-transform disabled:opacity-60"
            aria-label="Gefällt mir"
          >
            <Heart className="h-7 w-7 fill-current" />
          </button>
        </div>

        {localError && (
          <p className="mt-3 text-center text-sm font-medium text-rose-500">{localError}</p>
        )}
      </div>
    </div>
  );
}

// Bestätigungsdialog-Komponente
function ResetConfirmDialog({ isOpen, onConfirm, onCancel, isResetting }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3 text-rose-500">
          <RotateCcw className="h-6 w-6" />
          <h3 className="text-xl font-bold">Woche zurücksetzen?</h3>
        </div>
        
        <p className="mt-3 text-slate-600">
          Dadurch werden <strong>alle geplanten Gerichte</strong> und die <strong>gesamte Einkaufsliste</strong> unwiderruflich gelöscht.
        </p>
        
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isResetting}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            disabled={isResetting}
            className="flex-1 rounded-xl bg-rose-500 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-rose-600 disabled:opacity-60"
          >
            {isResetting ? 'Wird gelöscht...' : 'Ja, löschen'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const navigate = useNavigate();
  const [week, setWeek] = useState(null);
  const [loadingWeek, setLoadingWeek] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetError, setResetError] = useState('');

  const loadWeek = async () => {
    try {
      setLoadingWeek(true);
      const result = await fetchActiveWeek();
      setWeek(result);
    } catch (err) {
      console.error('Fehler beim Laden der Woche:', err);
      setWeek(null);
    } finally {
      setLoadingWeek(false);
    }
  };

  useEffect(() => {
    loadWeek();
  }, []);

  const days = useMemo(() => normalizeDays(week), [week]);
  const shoppingItems = useMemo(() => normalizeShopping(week), [week]);
  const checkedItems = shoppingItems.filter((item) => item?.isChecked || item?.checked).length;
  const openItems = Math.max(shoppingItems.length - checkedItems, 0);
  const todayMeal = getMealFromDay(days[0]);
  const hasContent = days.length > 0 || shoppingItems.length > 0;

  const handleResetWeek = async () => {
    try {
      setResetting(true);
      setResetError('');
      
      console.log('🔄 Lösche Woche...');
      
      // API-Aufruf zum Löschen der kompletten Woche
      const result = await deleteActiveWeek();
      
      console.log('✅ Löschergebnis:', result);
      
      // WICHTIG: Nach dem Löschen die aktuelle Woche NEU laden
      // Das sollte null zurückgeben, weil keine aktive Woche mehr existiert
      await loadWeek();
      
      // Optional: Kurze Erfolgsmeldung
      if (result && result.deletedWeeks > 0) {
        console.log(`✅ Erfolg: ${result.deletedShoppingItems} Einkaufsitems gelöscht`);
      }
      
    } catch (error) {
      console.error('❌ Fehler beim Zurücksetzen:', error);
      setResetError('Die Woche konnte nicht zurückgesetzt werden. Bitte versuche es später erneut.');
    } finally {
      setResetting(false);
      setShowResetConfirm(false);
    }
  };

  if (loadingWeek) return <div className="min-h-screen bg-slate-50" />;
  if (!hasContent) return <EmptySwipeState onWeekCreated={loadWeek} />;

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
      <div className="mx-auto max-w-md space-y-4">
        <section className="overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#f5f0ff_0%,#f8f5ef_100%)] p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">Heute</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                {todayMeal ? getMealTitle(todayMeal) : 'Deine Woche ist bereit'}
              </h1>
              <p className="mt-3 text-base text-slate-500">
                {todayMeal ? 'Das ist heute dran.' : 'Alles Nötige ist schon da.'}
              </p>
            </div>
            <div className="rounded-[24px] bg-white/85 px-4 py-3 text-center shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
              <div className="text-xl font-bold text-emerald-600">{days.length}/7</div>
              <div className="text-xs text-slate-500">geplant</div>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={() => navigate('/plan')}
          className="flex w-full items-center justify-between rounded-[28px] bg-slate-950 px-5 py-5 text-left text-white shadow-[0_14px_30px_rgba(2,6,23,0.22)]"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold">Jetzt kochen</div>
              <div className="text-sm text-slate-300">Rezept ansehen</div>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">Öffnen</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/shopping')}
          className="flex w-full items-center justify-between rounded-[28px] bg-[linear-gradient(135deg,#fff3e8_0%,#fffaf6_100%)] px-5 py-5 text-left shadow-[0_12px_28px_rgba(15,23,42,0.05)] ring-1 ring-orange-100"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
              <ShoppingCart className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">Einkaufsliste öffnen</div>
              <div className="text-sm text-slate-500">{openItems} noch offen</div>
            </div>
          </div>
          <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600">Öffnen</span>
        </button>

        <div className="rounded-[24px] bg-white px-5 py-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
          {days.length} Gerichte geplant · {openItems} Einkäufe offen
        </div>

        {/* NEU: Reset-Button mit Bestätigungsdialog */}
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          disabled={resetting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-60"
        >
          <RotateCcw className="h-4 w-4" />
          {resetting ? 'Wird gelöscht...' : 'Komplette Woche löschen'}
        </button>
        
        {/* NEU: Fehlermeldung anzeigen */}
        {resetError && (
          <p className="text-center text-sm font-medium text-rose-500">{resetError}</p>
        )}
        
        {/* NEU: Bestätigungsdialog */}
        <ResetConfirmDialog
          isOpen={showResetConfirm}
          onConfirm={handleResetWeek}
          onCancel={() => setShowResetConfirm(false)}
          isResetting={resetting}
        />
      </div>
    </div>
  );
}