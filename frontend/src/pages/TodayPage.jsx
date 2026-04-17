import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ShoppingCart, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteActiveWeek, fetchActiveWeek } from "../api/weekApi";

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

export default function TodayPage() {
  const navigate = useNavigate();
  const [week, setWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const loadWeek = async () => {
      try {
        const data = await fetchActiveWeek();
        console.log("fetchActiveWeek raw response:", data);
        setWeek(data || null);
      } catch (error) {
        setWeek(null);
      } finally {
        setLoading(false);
      }
    };

    loadWeek();
  }, []);

  const days = week?.days ?? week?.weekDays ?? week?.week_days ?? [];
  const shoppingItems = normalizeShoppingItems(week);

  const todayMeal = days[0]?.recipe || days[0] || null;

  const checkedItems = shoppingItems.filter(
    (item) => item.checked ?? item.isChecked ?? false
  ).length;

  const progressText = useMemo(() => {
    return `${days.length}/${Math.max(days.length, 5)} Tage`;
  }, [days.length]);

  const handleResetWeek = async () => {
    try {
      setResetting(true);
      await deleteActiveWeek();
      navigate("/swipe");
    } catch (error) {
      console.error("Aktive Woche konnte nicht gelöscht werden:", error);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
        <div className="mx-auto max-w-md">
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Lade deinen Tagesüberblick...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!week) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
        <div className="mx-auto max-w-md space-y-5">
          <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
              Heute
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              Deine Woche ist bereit.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Plane deine erste Woche und die App übernimmt Einkauf und Struktur.
            </p>
          </section>

          <button
            type="button"
            onClick={() => navigate("/swipe")}
            className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white shadow-sm transition active:scale-[0.99]"
          >
            Erste Woche planen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
      <div className="mx-auto max-w-md space-y-5">
        <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
            Heute
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            Deine Woche ist bereit.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Wenig denken, direkt loslegen.
          </p>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
                Heute zu tun
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Wenig denken, direkt loslegen
              </h2>
            </div>

            <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              {progressText}
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate("/shopping")}
              className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-slate-500" />
                <span className="text-lg font-semibold text-slate-900">
                  Einkauf prüfen
                </span>
              </div>
              <span className="text-base text-slate-500">
                {checkedItems}/{shoppingItems.length} Artikel erledigt.
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/plan")}
              className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <ChefHat className="h-5 w-5 text-slate-500" />
                <span className="text-lg font-semibold text-slate-900">
                  Kochen einplanen
                </span>
              </div>
              <span className="max-w-[140px] text-right text-base text-slate-500">
                {todayMeal?.title || "Noch kein Gericht geplant."}
              </span>
            </button>
          </div>
        </section>

        <section
          onClick={() => navigate("/plan")}
          className="cursor-pointer rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
            Diese Woche
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">
            Dein Essensplan
          </h2>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays className="h-4 w-4" />
            <span>{days.length} Gerichte ausgewählt</span>
          </div>
        </section>

        <section
          onClick={() => navigate("/shopping")}
          className="cursor-pointer rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
                Einkauf
              </p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Die Liste für diese Woche
              </h2>
            </div>

            <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              {checkedItems}/{shoppingItems.length}
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={handleResetWeek}
          disabled={resetting}
          className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-60"
        >
          {resetting ? "Wird zurückgesetzt..." : "Neue Woche planen"}
        </button>
      </div>
    </div>
  );
}
