import { ArrowLeft, Shield, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <motion.main initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 360, damping: 34 }} className="fixed inset-0 z-[70] overflow-y-auto bg-slate-50">
      <div className="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/90 px-4 pb-3 pt-[max(0.9rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 active:scale-95" aria-label="Zurück">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">MealPlan</p>
            <p className="text-sm font-bold text-slate-950">Datenschutz</p>
          </div>
          <div className="h-11 w-11" />
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4">
        <section className="rounded-[32px] bg-gradient-to-br from-emerald-200 via-teal-100 to-sky-100 p-5 shadow-sm">
          <Shield className="h-7 w-7 text-emerald-700" />
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950">Datenschutz</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">Kurz und klar: MealPlan nutzt deine Angaben nur für bessere Vorschläge.</p>
        </section>

        <section className="mt-5 space-y-3 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-base font-bold text-slate-950">Gespeicherte Daten</h2>
          <p className="text-sm leading-6 text-slate-600">E-Mail-Adresse, Haushaltstyp, Kinderanzahl, Benachrichtigungsstatus und deine Planungsdaten.</p>
        </section>

        <section className="mt-4 space-y-3 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-base font-bold text-slate-950">Warum?</h2>
          <p className="text-sm leading-6 text-slate-600">Damit Vorschläge, Einkaufsliste und Erinnerungen sinnvoll funktionieren.</p>
        </section>

        <section className="mt-4 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-red-100">
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-red-600" />
            <h2 className="text-base font-bold text-slate-950">Account löschen</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">Der Button ist bewusst noch deaktiviert, bis der sichere Backend-Endpunkt vorhanden ist.</p>
          <button type="button" disabled className="mt-4 w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white opacity-50">
            Account löschen bald verfügbar
          </button>
        </section>
      </div>
    </motion.main>
  );
}
