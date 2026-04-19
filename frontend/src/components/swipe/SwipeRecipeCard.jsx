import { motion } from "framer-motion";

export default function SwipeRecipeCard({ recipe, style = {}, dragProps = {} }) {
  if (!recipe) return null;

  return (
  <motion.div
    style={style}
    {...dragProps}
    className="absolute inset-0 rounded-[32px] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 touch-pan-y"
  >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
              Vorschlag
            </p>
            <h2 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-slate-900">
              {recipe.title}
            </h2>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            {recipe.category || "Gericht"}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Zeit</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {recipe.cookTime || recipe.cookingTime || "-"} Min.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Level</p>
            <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
              {recipe.difficulty || "einfach"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Typ</p>
            <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
              {recipe.dietType || recipe.type || "-"}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Warum das passt</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <li>• Schnell genug für euren Alltag</li>
            <li>• Passt zu euren aktuellen Präferenzen</li>
            <li>• Einfach für den Wochenplan kombinierbar</li>
          </ul>
        </div>

        <div className="mt-auto pt-6">
          <p className="text-center text-sm text-slate-400">
            Nach links = nein · Nach rechts = passt
          </p>
        </div>
      </div>
    </motion.div>
  );
}