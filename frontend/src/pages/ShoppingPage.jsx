import { useEffect, useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import {
  fetchActiveShoppingItems,
  fetchActiveWeek,
  setShoppingItemChecked,
  deleteShoppingItem,
  updateShoppingItemDetails,
} from "../api/weekApi";
import ShoppingListItem from "../components/shopping/ShoppingListItem";
import EditShoppingItemModal from "../components/shopping/EditShoppingItemModal";

function groupItemsByCategory(items) {
  return items.reduce((acc, item) => {
    const category = item.category || "Sonstiges";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});
}

function extractShoppingItems(result) {
  const candidates = [
    result?.shoppingItems,
    result?.shoppingList,
    result?.shopping_items,
    result?.week?.shoppingItems,
    result?.week?.shoppingList,
    result?.week?.shopping_items,
    result?.activeWeek?.shoppingItems,
    result?.activeWeek?.shoppingList,
    result?.activeWeek?.shopping_items,
    result?.data?.shoppingItems,
    result?.data?.shoppingList,
    result?.data?.shopping_items,
    result?.data?.week?.shoppingItems,
    result?.data?.week?.shoppingList,
    result?.data?.week?.shopping_items,
    result?.data?.activeWeek?.shoppingItems,
    result?.data?.activeWeek?.shoppingList,
    result?.data?.activeWeek?.shopping_items,
    result?.data,
    result,
  ];

  const firstArray = candidates.find((candidate) => Array.isArray(candidate));
  return firstArray || [];
}

export default function ShoppingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const result = await fetchActiveShoppingItems();
        console.log("fetchActiveShoppingItems raw response:", result);

        let extractedItems = extractShoppingItems(result);
        console.log("fetchActiveShoppingItems extracted items:", extractedItems);

        if (extractedItems.length === 0) {
          const activeWeek = await fetchActiveWeek();
          console.log("fetchActiveWeek fallback raw response:", activeWeek);
          extractedItems = extractShoppingItems(activeWeek);
          console.log("fetchActiveWeek fallback extracted items:", extractedItems);
        }

        const normalized = extractedItems.map((item, index) => ({
          ...item,
          id: item.id ?? item.itemId ?? item.shoppingItemId ?? `${item.name || item.title || 'item'}-${index}`,
          name: item.name ?? item.title ?? item.ingredientName ?? "Unbekannt",
          checked: item.checked ?? item.isChecked ?? false,
        }));

        console.log("final normalized shopping items:", normalized);
        setItems(normalized);
      } catch (error) {
        console.error("Fehler beim Laden der Einkaufsliste:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  const groupedItems = useMemo(() => groupItemsByCategory(items), [items]);
  const checkedCount = items.filter((item) => item.checked).length;

  async function handleToggle(item) {
    const currentChecked = item.checked;
    const nextChecked = !currentChecked;

    setItems((prev) =>
      prev.map((entry) =>
        entry.id === item.id ? { ...entry, checked: nextChecked } : entry
      )
    );

    try {
      await setShoppingItemChecked({
        itemId: item.id,
        checked: nextChecked,
      });
    } catch (error) {
      setItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id ? { ...entry, checked: currentChecked } : entry
        )
      );
    }
  }

  async function handleDelete(item) {
    const prevItems = items;
    setItems((curr) => curr.filter((entry) => entry.id !== item.id));

    try {
      await deleteShoppingItem(item.id);
    } catch (error) {
      setItems(prevItems);
    }
  }

  async function handleSaveEdit(updatedItem) {
    const prevItems = items;

    setItems((curr) =>
      curr.map((entry) => (entry.id === updatedItem.id ? updatedItem : entry))
    );
    setEditingItem(null);

    try {
      await updateShoppingItemDetails(updatedItem);
    } catch (error) {
      setItems(prevItems);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-28">
      <div className="mx-auto max-w-md">
        <section className="mb-5 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
            Einkauf
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Deine Einkaufsliste
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {checkedCount}/{items.length} Artikel erledigt
          </p>
        </section>

        {loading ? (
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Einkaufsliste wird geladen...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-slate-500" />
              <p className="text-base font-semibold text-slate-900">
                Noch keine Einkaufsliste vorhanden.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <section key={category}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {category}
                  </h2>
                  <span className="text-xs text-slate-400">
                    {categoryItems.length} Artikel
                  </span>
                </div>

                <div className="space-y-3">
                  {categoryItems.map((item) => (
                    <ShoppingListItem
                      key={item.id}
                      item={item}
                      onToggleDone={handleToggle}
                      onDelete={handleDelete}
                      onEdit={setEditingItem}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <EditShoppingItemModal
        item={editingItem}
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
