import { ArrowLeft, Crown, LogOut, Shield, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function SettingsPage({ onLogout }) {
  const navigate = useNavigate();

  function handleLogoutClick() {
    if (typeof onLogout === "function") {
      onLogout();
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
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 active:scale-95"
            aria-label="Zurück"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              MealPlan
            </p>
            <p className="text-sm font-bold text-slate-950">Einstellungen</p>
          </div>
          <div className="h-11 w-11" />
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4">
        <section className="rounded-[32px] bg-gradient-to-br from-indigo-200 via-sky-100 to-emerald-100 p-5 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">
            App
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950">
            Allgemeine Einstellungen
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Account, Datenschutz und später dein Pro-Abo.
          </p>
        </section>

        <div className="mt-5 space-y-4">
          <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-950">
                MealPlan Pro
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Für später: mehr Vorschläge, smarte Planung und Stripe-Abo.
            </p>
            <button
              type="button"
              disabled
              className="mt-4 w-full rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-bold text-white opacity-60"
            >
              Subscribe bald verfügbar
            </button>
          </section>

          <button
            type="button"
            onClick={() => navigate("/more/privacy")}
            className="flex w-full items-center gap-3 rounded-[24px] bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 active:scale-[0.99]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
              <Shield className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-950">
                Datenschutz
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                Daten und Privatsphäre
              </span>
            </span>
          </button>

          <button
            type="button"
            disabled
            className="flex w-full items-center gap-3 rounded-[24px] bg-white p-4 text-left opacity-60 shadow-sm ring-1 ring-slate-200"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-950">
                Account löschen
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                Machen wir als nächstes sauber
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={handleLogoutClick}
            className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-white p-4 text-sm font-bold text-red-600 shadow-sm ring-1 ring-red-100 active:scale-[0.99]"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </motion.main>
  );
}
