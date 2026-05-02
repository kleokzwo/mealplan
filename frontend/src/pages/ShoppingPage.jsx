import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, RefreshCcw, ShoppingCart } from "lucide-react";
import {
  deleteShoppingItem,
  setShoppingItemChecked,
  updateShoppingItemDetails,
} from "../api/weekApi";
import ShoppingListItem from "../components/shopping/ShoppingListItem";
import EditShoppingItemModal from "../components/shopping/EditShoppingItemModal";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function groupItemsByCategory(items) {
  return items.reduce((acc, item) => {
    const category = item.category || "Sonstiges";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});
}

function firstArray(...values) {
  return values.find((value) => Array.isArray(value)) || [];
}

function extractShoppingItems(payload) {
  const raw = payload?.data ?? payload ?? {};

  return firstArray(
    raw.shoppingItems,
    raw.shoppingList,
    raw.shopping_items,
    raw.week?.shoppingItems,
    raw.week?.shoppingList,
    raw.week?.shopping_items,
    raw.activeWeek?.shoppingItems,
    raw.activeWeek?.shoppingList,
    raw.activeWeek?.shopping_items,
    payload?.shoppingItems,
    payload?.shoppingList,
    payload?.shopping_items
  );
}

function normalizeShoppingItem(item, index) {
  const id = item.id ?? item.itemId ?? item.shoppingItemId ?? item.shopping_item_id;
  const checked = Boolean(item.checked ?? item.isChecked ?? item.is_checked ?? false);
  const amount = item.amount ?? item.quantity ?? "";

  return {
    ...item,
    id: id ?? `shopping-item-${index}`,
    name: item.name ?? item.title ?? item.ingredientName ?? item.ingredient_name ?? "Unbekannt",
    quantity: item.quantity ?? amount,
    amount,
    unit: item.unit ?? "",
    category: item.category ?? "Sonstiges",
    checked,
    isChecked: checked,
  };
}

async function fetchActiveWeekDirect() {
  const token = localStorage.getItem("token");
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(`${API_URL}/weeks/active`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);

    if (!response.ok) {
      const error = new Error(
        payload?.message || payload?.error || "Einkaufsliste konnte nicht geladen werden."
      );
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Einkaufsliste lädt zu lange. Bitte Backend prüfen und nochmal versuchen.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export default function ShoppingPage() {
  const requestIdRef = useRef(0);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const loadItems = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setErrorMessage("");

    try {
      const activeWeekPayload = await fetchActiveWeekDirect();
      const nextItems = extractShoppingItems(activeWeekPayload).map(normalizeShoppingItem);

      if (requestIdRef.current === requestId) {
        setItems(nextItems);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Einkaufsliste:", error);

      if (requestIdRef.current === requestId) {
        setItems([]);
        setErrorMessage(error?.message || "Einkaufsliste konnte nicht geladen werden.");
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const groupedItems = useMemo(() => groupItemsByCategory(items), [items]);
  const checkedCount = items.filter((item) => item.checked || item.isChecked).length;

  async function handleToggleDone(item) {
    const currentChecked = Boolean(item.checked ?? item.isChecked ?? false);
    const nextChecked = !currentChecked;

    setItems((prev) =>
      prev.map((entry) =>
        entry.id === item.id
          ? { ...entry, checked: nextChecked, isChecked: nextChecked }
          : entry
      )
    );

    try {
      await setShoppingItemChecked({ itemId: item.id, checked: nextChecked });
    } catch (error) {
      console.error("Fehler beim Aktualisieren vom Einkaufsartikel:", error);
      setItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? { ...entry, checked: currentChecked, isChecked: currentChecked }
            : entry
        )
      );
    }
  }

  async function handleDelete(item) {
    const previousItems = items;
    setItems((current) => current.filter((entry) => entry.id !== item.id));

    try {
      await deleteShoppingItem(item.id);
    } catch (error) {
      console.error("Fehler beim Löschen vom Einkaufsartikel:", error);
      setItems(previousItems);
    }
  }

  async function handleSaveEdit(updatedItem) {
    const previousItems = items;

    setItems((current) =>
      current.map((entry) => (entry.id === updatedItem.id ? updatedItem : entry))
    );
    setEditingItem(null);

    try {
      await updateShoppingItemDetails(updatedItem);
      await loadItems();
    } catch (error) {
      console.error("Fehler beim Speichern vom Einkaufsartikel:", error);
      setItems(previousItems);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-28 pt-6">
      <div className="mx-auto max-w-md space-y-5">
        <header className="rounded-[30px] bg-slate-950 p-5 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-300 text-slate-950">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-lime-200">
                Einkauf
              </p>
              <h1 className="text-2xl font-black tracking-tight">
                Deine Einkaufsliste
              </h1>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white/90">
            {checkedCount}/{items.length} Artikel erledigt
          </div>
        </header>

        {errorMessage ? (
          <section className="rounded-[28px] bg-red-50 p-4 text-sm leading-6 text-red-700 ring-1 ring-red-100">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-bold">Einkaufsliste konnte nicht geladen werden.</p>
                <p className="mt-1">{errorMessage}</p>
              </div>
            </div>
          </section>
        ) : null}

        <button
          type="button"
          onClick={loadItems}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-white px-5 py-4 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 disabled:opacity-60"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Einkaufsliste wird geladen..." : "Einkaufsliste aktualisieren"}
        </button>

        {loading ? (
          <section className="rounded-[28px] bg-white p-5 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
            Einkaufsliste wird geladen...
          </section>
        ) : items.length === 0 ? (
          <section className="rounded-[28px] bg-white p-5 text-sm leading-6 text-slate-500 shadow-sm ring-1 ring-slate-200">
            Noch keine Einkaufsliste vorhanden. Wähle zuerst Gerichte aus und erstelle daraus deine Einkaufsliste.
          </section>
        ) : (
          <section className="space-y-4">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div
                key={category}
                className=""
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-base font-black text-slate-950">{category}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                    {categoryItems.length} Artikel
                  </span>
                </div>

                <div className="space-y-3">
                  {categoryItems.map((item) => (
                    <ShoppingListItem
                      key={item.id}
                      item={item}
                      onToggleDone={handleToggleDone}
                      onDelete={handleDelete}
                      onEdit={setEditingItem}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      <EditShoppingItemModal
        item={editingItem}
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />
    </main>
  );
}
