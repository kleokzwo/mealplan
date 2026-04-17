import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function EditShoppingItemModal({
  item,
  open,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    unit: "",
    category: "",
  });

  useEffect(() => {
    if (!item) return;

    setForm({
      name: item.name || "",
      quantity: item.quantity || "",
      unit: item.unit || "",
      category: item.category || "",
    });
  }, [item]);

  if (!open || !item) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...item,
      ...form,
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-slate-900/40">
      <div className="w-full rounded-t-[32px] bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Artikel bearbeiten</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Menge
              </label>
              <input
                value={form.quantity}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, quantity: e.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Einheit
              </label>
              <input
                value={form.unit}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, unit: e.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Kategorie
            </label>
            <input
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white"
          >
            Speichern
          </button>
        </form>
      </div>
    </div>
  );
}