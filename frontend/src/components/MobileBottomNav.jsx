import {
  CalendarDays,
  Home,
  MoreHorizontal,
  ShoppingCart,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Plan", icon: CalendarDays, path: "/plan" },
  { label: "Einkauf", icon: ShoppingCart, path: "/shopping" },
  { label: "Mehr", icon: MoreHorizontal, path: "/more" },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.55rem)]">
      <nav className="pointer-events-auto mx-auto max-w-md rounded-[30px] border border-white/10 bg-[#141414]/95 px-2 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.38)] backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active =
              location.pathname === tab.path ||
              (tab.path !== "/" && location.pathname.startsWith(tab.path));

            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => navigate(tab.path)}
                className={`flex min-h-[64px] appearance-none flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-2 outline-none transition active:scale-[0.98] ${
                  active
                    ? "bg-lime-300 text-slate-950"
                    : "bg-transparent text-white/70 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
                <span className="text-[11px] font-semibold tracking-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
