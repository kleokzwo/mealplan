import { CalendarDays, CheckCircle2, ShoppingCart } from "lucide-react";

const fallbackDayNames = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

export default function PlanResult({
  planDays = [],
  shoppingItems = [],
  onOpenShopping,
  onOpenToday,
  onRestart,
}) {
  const normalizedDays = planDays.map((day, index) => {
    const recipe = day.recipe || day;
    return {
      id: day.id || recipe.id || `day-${index}`,
      dayName: day.dayName || fallbackDayNames[index] || `Tag ${index + 1}`,
      recipe,
    };
  });

  const groupedShoppingItems = shoppingItems.reduce((acc, item) => {
    const category = item.category || "Sonstiges";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
      <div className="mx-auto max-w-md space-y-5">
        <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-700" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
                Diese Woche
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Deine Woche ist bereit
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Wochenplan und Einkaufsliste wurden automatisch für dich vorbereitet.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-bold text-slate-900">Dein Wochenplan</h2>
          </div>

          <div className="space-y-3">
            {normalizedDays.length === 0 ? (
              <div className="rounded-[24px] bg-slate-50 px-4 py-4 text-sm text-slate-500">
                Noch keine Gerichte im Plan.
              </div>
            ) : (
              normalizedDays.map((day) => (
                <article
                  key={day.id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-500">
                        {day.dayName}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold leading-tight text-slate-900">
                        {day.recipe.title}
                      </h3>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                      {day.recipe.category || "Gericht"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
                    <span>{day.recipe.cookTime || day.recipe.cookingTime || "-"} Min.</span>
                    <span>·</span>
                    <span>{day.recipe.difficulty || "einfach"}</span>
                    <span>·</span>
                    <span>{day.recipe.dietType || day.recipe.type || "-"}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-bold text-slate-900">Deine Einkaufsliste</h2>
          </div>

          {shoppingItems.length === 0 ? (
            <div className="rounded-[24px] bg-slate-50 px-4 py-4 text-sm text-slate-500">
              Noch keine Zutaten vorhanden.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedShoppingItems).map(([category, items]) => (
                <div key={category}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {category}
                    </p>
                    <span className="text-xs text-slate-400">{items.length} Artikel</span>
                  </div>

                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id || `${category}-${item.name}`}
                        className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <p className="text-base font-medium text-slate-900">{item.name}</p>
                        {(item.quantity || item.unit) && (
                          <p className="mt-1 text-sm text-slate-500">
                            {[item.quantity, item.unit].filter(Boolean).join(" ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onOpenToday}
            className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white shadow-sm transition active:scale-[0.99]"
          >
            Zu Home
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenShopping}
              className="rounded-2xl bg-slate-100 px-4 py-4 text-base font-semibold text-slate-700 transition active:scale-[0.99]"
            >
              Einkauf öffnen
            </button>

            <button
              type="button"
              onClick={onRestart}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-700 transition active:scale-[0.99]"
            >
              Neu planen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}