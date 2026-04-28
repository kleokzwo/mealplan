import { useEffect, useState } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMe, updateNotificationPreference } from "../api/userApi";

const OPTIONS = [
  { value: "sofort", label: "Sofort", text: "Du bekommst Erinnerungen direkt." },
  { value: "täglich", label: "Täglich", text: "Einmal am Tag, empfohlen." },
  { value: "nie", label: "Aus", text: "Keine E-Mail-Benachrichtigungen." },
];

function unwrapUser(response) {
  return response?.data?.data || response?.data || response || {};
}

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const [value, setValue] = useState("täglich");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const user = unwrapUser(await getMe());
        setValue(user.notificationPreference || user.notification_preference || "täglich");
      } catch (error) {
        console.error("Fehler beim Laden der Benachrichtigungen:", error);
      }
    }

    loadSettings();
  }, []);

  async function handleChange(newValue) {
    const previousValue = value;
    setValue(newValue);
    setMessage("");

    try {
      await updateNotificationPreference(newValue);
      setMessage("Benachrichtigung gespeichert.");
    } catch (error) {
      console.error(error);
      setValue(previousValue);
      setMessage(error?.data?.error || error?.message || "Speichern fehlgeschlagen.");
    }
  }

  return (
    <motion.main
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -24, opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="min-h-screen bg-slate-50 px-4 pb-28 pt-4"
    >
      <div className="mx-auto max-w-md space-y-5">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 active:scale-95"
            aria-label="Zurück"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">
              MealPlan
            </p>
            <h1 className="text-xl font-black text-slate-950">Benachrichtigungen</h1>
          </div>
        </header>

        <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-indigo-500" />
            <div>
              <h2 className="text-base font-black text-slate-950">E-Mail</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Wähle, ob und wie oft MealPlan dich erinnern soll.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {OPTIONS.map((option) => {
              const active = value === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange(option.value)}
                  className={`w-full rounded-[22px] p-4 text-left shadow-sm ring-1 transition active:scale-[0.99] ${
                    active
                      ? "bg-slate-950 text-white ring-slate-950"
                      : "bg-slate-50 text-slate-800 ring-slate-200"
                  }`}
                >
                  <p className="text-sm font-black">{option.label}</p>
                  <p className={`mt-1 text-sm ${active ? "text-slate-200" : "text-slate-500"}`}>
                    {option.text}
                  </p>
                </button>
              );
            })}
          </div>

          {message ? (
            <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              {message}
            </p>
          ) : null}
        </section>
      </div>
    </motion.main>
  );
}
