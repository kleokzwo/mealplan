import { Settings, Users, Bell, CircleHelp } from "lucide-react";

const items = [
  {
    icon: Settings,
    title: "Einstellungen",
    text: "App, Präferenzen und Verhalten anpassen",
  },
  {
    icon: Users,
    title: "Familie verwalten",
    text: "Mitglieder und Haushalt später erweitern",
  },
  {
    icon: Bell,
    title: "Benachrichtigungen",
    text: "Erinnerungen und Updates steuern",
  },
  {
    icon: CircleHelp,
    title: "Hilfe",
    text: "Fragen, Feedback und Support",
  },
];

export default function MorePage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
      <div className="mx-auto max-w-md">
        <section className="mb-5 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
            Mehr
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Mehr Optionen
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Alles, was nicht in den schnellen Alltagsflow gehört.
          </p>
        </section>

        <div className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                type="button"
                className="flex w-full items-start gap-4 rounded-[24px] bg-white p-4 text-left shadow-sm ring-1 ring-slate-200"
              >
                <div className="rounded-2xl bg-slate-100 p-3">
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {item.text}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}