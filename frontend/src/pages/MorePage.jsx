import { Settings, Users, Bell, CircleHelp, Shield, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { APP_VERSION, CHANGELOG } from "../config/appInfo";

const items = [
  { icon: Settings, title: "Einstellungen", text: "App, Account und Pro-Abo", path: "/settings" },
  { icon: Users, title: "Familie verwalten", text: "Haushalt und Kinderanzahl ändern", path: "/family" },
  { icon: Bell, title: "Benachrichtigungen", text: "E-Mail ein oder ausschalten", path: "/settings/notifications" },
  { icon: Shield, title: "Datenschutz", text: "Daten, Privatsphäre und Account löschen", path: "/more/privacy" },
  { icon: CircleHelp, title: "Hilfe", text: "Fragen, Feedback und Support", path: "/help" },
  {
  icon: Sparkles,
  title: `Neu in MealPlan ${APP_VERSION}`,
  text: CHANGELOG[0].title,
  path: "/changelog",
},
];

export default function MorePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-28 pt-8">
      <div className="mx-auto max-w-md">
        <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-500">Mehr</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-950">Mehr Optionen</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">Alles, was nicht in den schnellen Alltagsflow gehört.</p>
        </section>

        <div className="mt-5 space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.title} type="button" onClick={() => navigate(item.path)} className="flex w-full items-start gap-4 rounded-[24px] bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 active:scale-[0.99]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-950">{item.title}</span>
                  <span className="mt-1 block text-sm text-slate-500">{item.text}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
