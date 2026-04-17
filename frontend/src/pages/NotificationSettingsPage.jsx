import { useState } from "react";
import { updateNotificationPreference } from "@/api/userApi";

const OPTIONS = [
  { value: "sofort", label: "Sofort" },
  { value: "täglich", label: "Täglich (empfohlen)" },
  { value: "nie", label: "Aus" },
];

export default function NotificationSettingsPage({ user }) {
  const [value, setValue] = useState(user.notificationPreference);

  async function handleChange(newValue) {
    setValue(newValue); // instant UI

    try {
      await updateNotificationPreference(newValue);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold">Benachrichtigungen</h1>
      <p className="text-sm text-slate-500 mt-1">
        Wie oft willst du erinnert werden?
      </p>

      <div className="mt-4 space-y-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleChange(opt.value)}
            className={`w-full rounded-xl p-4 text-left border ${
              value === opt.value
                ? "border-indigo-500 bg-indigo-50"
                : "border-slate-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}