import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { APP_VERSION, CHANGELOG } from "../config/appInfo";

export default function ChangelogPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-6 pb-28">
        <div className="mx-auto w-full max-w-md px-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 active:scale-95"
        aria-label="Zurück"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="mb-6">
        <p className="text-sm font-semibold text-emerald-600">MealPlan {APP_VERSION}</p>
        <h1 className="text-3xl font-bold text-slate-950">Neuigkeiten</h1>
        <p className="mt-2 text-sm text-slate-500">
          Hier siehst du, was sich geändert hat und warum es wichtig ist.
        </p>
      </div>

      <div className="space-y-4">
        {CHANGELOG.map((entry) => (
          <section
            key={entry.version}
            className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Sparkles size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">{entry.title}</h2>
                <p className="text-sm text-slate-500">
                  Version {entry.version} · {entry.date}
                </p>
              </div>
            </div>

            <ul className="space-y-3">
              {entry.changes.map((change) => (
                <li key={change} className="flex gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} />
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      </div>
    </div>
  );
}