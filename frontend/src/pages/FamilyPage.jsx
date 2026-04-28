import { useEffect, useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMe, updateHouseholdProfile } from "../api/userApi";

const householdOptions = [
  { value: "single", label: "Single" },
  { value: "paar", label: "Paar" },
  { value: "familie", label: "Familie" },
];

function unwrapUser(response) {
  return response?.data?.data || response?.data || response || {};
}

export default function FamilyPage() {
  const navigate = useNavigate();
  const [householdType, setHouseholdType] = useState("single");
  const [childrenCount, setChildrenCount] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = unwrapUser(await getMe());
        setHouseholdType(user.householdType || user.household_type || "single");
        setChildrenCount(Number(user.childrenCount ?? user.children_count ?? 1));
      } catch (error) {
        console.error("Fehler beim Laden vom Haushalt:", error);
      }
    }

    loadProfile();
  }, []);

  async function handleSave() {
    const nextChildrenCount = householdType === "familie" ? Number(childrenCount || 1) : 0;

    setIsSaving(true);
    setMessage("");

    try {
      const response = await updateHouseholdProfile({ householdType, childrenCount: nextChildrenCount });
      const savedUser = unwrapUser(response);
      const savedHouseholdType = savedUser.householdType || savedUser.household_type || householdType;
      const savedChildrenCount = Number(savedUser.childrenCount ?? savedUser.children_count ?? nextChildrenCount);

      setHouseholdType(savedHouseholdType);
      setChildrenCount(savedHouseholdType === "familie" ? savedChildrenCount || 1 : 1);
      setMessage("Haushalt gespeichert.");
    } catch (error) {
      setMessage(error?.data?.error || error?.message || "Speichern fehlgeschlagen.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <motion.main
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 360, damping: 34 }}
      className="fixed inset-0 z-[70] overflow-y-auto bg-slate-50"
    >
      <div className="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/90 px-4 pb-3 pt-[max(0.9rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 active:scale-95" aria-label="Zurück">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">MealPlan</p>
            <p className="text-sm font-bold text-slate-950">Familie</p>
          </div>
          <div className="h-11 w-11" />
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4">
        <section className="rounded-[32px] bg-gradient-to-br from-orange-200 via-amber-100 to-yellow-100 p-5 shadow-sm">
          <Users className="h-7 w-7 text-orange-600" />
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950">Haushalt verwalten</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">Damit die Rezeptvorschläge besser zu deinem Alltag passen.</p>
        </section>

        <section className="mt-5 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="grid grid-cols-3 gap-2">
            {householdOptions.map((option) => {
              const active = householdType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setHouseholdType(option.value)}
                  className={`rounded-2xl px-3 py-3 text-sm font-bold transition active:scale-95 ${active ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {householdType === "familie" ? (
            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-700">Anzahl Kinder</label>
              <select value={childrenCount} onChange={(event) => setChildrenCount(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold outline-none">
                {Array.from({ length: 12 }, (_, index) => index + 1).map((count) => (
                  <option key={count} value={count}>{count}</option>
                ))}
              </select>
            </div>
          ) : null}

          <button type="button" onClick={handleSave} disabled={isSaving} className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-sm active:scale-[0.99] disabled:opacity-60">
            {isSaving ? "Speichert..." : "Speichern"}
          </button>
        </section>

        {message ? <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">{message}</p> : null}
      </div>
    </motion.main>
  );
}
