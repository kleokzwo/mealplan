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
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = location.pathname === tab.path;

          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`m-0 flex min-w-[72px] appearance-none flex-col items-center justify-center gap-1 rounded-2xl border-0 bg-transparent px-3 py-2 shadow-none outline-none ring-0 transition ${
                active ? "text-slate-900" : "text-slate-400"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={2.2} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}