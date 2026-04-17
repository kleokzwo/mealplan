import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveOnboardingProfile } from "../api/userApi";

const OPTIONS = [
  { value: "single", label: "Ich lebe allein" },
  { value: "couple", label: "Wir sind zu zweit" },
  { value: "family", label: "Wir sind eine Familie" },
];

export default function HouseholdSetupPage() {
  const navigate = useNavigate();

  const [householdType, setHouseholdType] = useState("single");
  const [childrenCount, setChildrenCount] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    setIsSaving(true);

    try {
      await saveOnboardingProfile({
        householdType,
        childrenCount: householdType === "family" ? childrenCount : 0,
      });

      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.data?.error || err.message || "Speichern fehlgeschlagen");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Wie lebt ihr gerade?</h1>
      <p className="mt-2 text-sm text-slate-500">
        Damit wir passende Rezepte und Mengen für euch auswählen können.
      </p>

      <div className="mt-6 space-y-3">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${
              householdType === option.value
                ? "border-indigo-500 bg-indigo-50"
                : "border-slate-200"
            }`}
          >
            <input
              type="radio"
              name="householdType"
              value={option.value}
              checked={householdType === option.value}
              onChange={() => setHouseholdType(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>

      {householdType === "family" && (
        <div className="mt-6">
          <label className="block text-sm font-medium">
            Wie viele Kinder essen meistens mit?
          </label>

          <select
            value={childrenCount}
            onChange={(e) => setChildrenCount(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-slate-300 p-3"
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>
      )}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSaving}
        className="mt-8 w-full rounded-2xl bg-black px-4 py-3 text-white disabled:opacity-50"
      >
        {isSaving ? "Speichert..." : "Weiter"}
      </button>
    </div>
  );
}