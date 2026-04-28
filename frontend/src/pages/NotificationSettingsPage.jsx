import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMe, updateNotificationPreference } from "../api/userApi";

function unwrapUser(response) {
  return response?.data?.data || response?.data || response || {};
}

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const user = unwrapUser(await getMe());
        const preference = user.notificationPreference || user.notification_preference || "täglich";
        setEmailEnabled(preference !== "nie");
      } catch (error) {
        console.error("Fehler beim Laden der Benachrichtigungen:", error);
      }
    }

    loadSettings();
  }, []);

  async function handleToggle(nextValue) {
    setEmailEnabled(nextValue);
    setMessage("");

    try {
      await updateNotificationPreference(nextValue ? "täglich" : "nie");
      setMessage(nextValue ? "E-Mail-Benachrichtigungen aktiviert." : "E-Mail-Benachrichtigungen deaktiviert.");
    } catch (error) {
      setEmailEnabled(!nextValue);
      setMessage(error?.data?.error || error?.message || "Änderung fehlgeschlagen.");
    }
  }

  return (
    <motion.main initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 360, damping: 34 }} className="fixed inset-0 z-[70] overflow-y-auto bg-slate-50">
      <div className="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/90 px-4 pb-3 pt-[max(0.9rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 active:scale-95" aria-label="Zurück">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">MealPlan</p>
            <p className="text-sm font-bold text-slate-950">Benachrichtigungen</p>
          </div>
          <div className="h-11 w-11" />
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4">
        <section className="rounded-[32px] bg-gradient-to-br from-sky-200 via-blue-100 to-indigo-100 p-5 shadow-sm">
          <Bell className="h-7 w-7 text-indigo-600" />
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950">Benachrichtigungen</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">Steuere, ob MealPlan dir E-Mails senden darf.</p>
        </section>

        <section className="mt-5 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-indigo-500" />
              <div>
                <h2 className="text-base font-bold text-slate-950">E-Mail</h2>
                <p className="text-sm text-slate-500">Erinnerungen und Updates per Mail.</p>
              </div>
            </div>
            <button type="button" onClick={() => handleToggle(!emailEnabled)} className={`h-8 w-14 rounded-full p-1 transition active:scale-95 ${emailEnabled ? "bg-indigo-500" : "bg-slate-300"}`} aria-label="E-Mail-Benachrichtigungen umschalten">
              <span className={`block h-6 w-6 rounded-full bg-white shadow transition ${emailEnabled ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
        </section>

        {message ? <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">{message}</p> : null}
      </div>
    </motion.main>
  );
}
