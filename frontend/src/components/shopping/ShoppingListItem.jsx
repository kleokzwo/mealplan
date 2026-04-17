import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Check, Trash2 } from "lucide-react";

const SWIPE_DONE_THRESHOLD = -90;
const SWIPE_DELETE_THRESHOLD = 90;

export default function ShoppingListItem({
  item,
  onToggleDone,
  onDelete,
  onEdit,
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-140, 0, 140], [-4, 0, 4]);

  const doneReveal = useTransform(x, [-140, -90, -24, 0], [1, 1, 0.25, 0]);
  const deleteReveal = useTransform(x, [0, 24, 90, 140], [0, 0.25, 1, 1]);

  const checked = item.checked ?? item.isChecked ?? false;

  function resetPosition() {
    animate(x, 0, { type: "spring", stiffness: 420, damping: 30 });
  }

  function handleDragEnd(_, info) {
    if (info.offset.x <= SWIPE_DONE_THRESHOLD) {
      onToggleDone(item);
      resetPosition();
      return;
    }

    if (info.offset.x >= SWIPE_DELETE_THRESHOLD) {
      onDelete(item);
      resetPosition();
      return;
    }

    resetPosition();
  }

  return (
    <div className="relative overflow-hidden rounded-[24px]">
      <motion.div
        style={{ opacity: doneReveal }}
        className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center overflow-hidden rounded-[24px]"
      >
        <div className="flex h-full w-full items-center rounded-[24px] bg-emerald-500 pl-6 pr-24 text-white">
          <div className="flex items-center gap-2 text-base font-semibold">
            <Check className="h-5 w-5" />
            Erledigt
          </div>
        </div>
      </motion.div>

      <motion.div
        style={{ opacity: deleteReveal }}
        className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-end overflow-hidden rounded-[24px]"
      >
        <div className="flex h-full w-full items-center justify-end rounded-[24px] bg-rose-500 pl-24 pr-6 text-white">
          <div className="flex items-center gap-2 text-base font-semibold">
            Löschen
            <Trash2 className="h-5 w-5" />
          </div>
        </div>
      </motion.div>

      <motion.button
        type="button"
        drag="x"
        dragElastic={0.08}
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate }}
        onDragEnd={handleDragEnd}
        onClick={() => onEdit(item)}
        className={`relative z-10 flex w-full items-center gap-4 rounded-[24px] border px-6 py-4 text-left shadow-sm transition ${
          checked
            ? "border-emerald-200 bg-emerald-50"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="min-w-0 flex-1">
          <p
            className={`text-base font-medium ${
              checked ? "text-slate-500 line-through" : "text-slate-900"
            }`}
          >
            {item.name}
          </p>

          {(item.quantity || item.unit) && (
            <p className="mt-1 text-sm text-slate-500">
              {[item.quantity, item.unit].filter(Boolean).join(" | ")}
            </p>
          )}
        </div>

        {(item.quantity || item.unit) && (
          <div className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800">
            {[item.quantity, item.unit].filter(Boolean).join(" | ")}
          </div>
        )}
      </motion.button>
    </div>
  );
}
