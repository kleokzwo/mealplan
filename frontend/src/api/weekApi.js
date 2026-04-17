import  httpClient  from './httpClient';

const normalizeShoppingItem = (item) => ({
  ...item,
  checked: item.checked ?? item.isChecked ?? false,
  isChecked: item.isChecked ?? item.checked ?? false,
  quantity: item.quantity ?? item.amount ?? '',
  amount:
    item.amount ??
    [item.quantity, item.unit].filter(Boolean).join(' ').trim(),
  unit: item.unit ?? '',
  category: item.category ?? 'Sonstiges',
});

export const fetchActiveWeek = async () => {
  return httpClient('/weeks/active');
};

export const createActiveWeek = async ({ selectedMealIds = [] } = {}) => {
  return httpClient('/weeks', {
    method: 'POST',
    body: JSON.stringify({ selectedMealIds }),
  });
};

export async function updateShoppingItem(id, updates) {
  const paths = [
    `/weeks/active/shopping-items/${id}`,
    `/weeks/active/shopping_items/${id}`,
    `/shopping-items/${id}`,
    `/shopping_items/${id}`,
  ];

  const payloads = [
    { checked: updates.checked },
    { isChecked: updates.checked },
  ];

  for (const path of paths) {
    for (const body of payloads) {
      try {
        console.log("TRY UPDATE:", path, body);
        return await httpClient.patch(path, body);
      } catch (err) {
        if (err.status !== 404) {
          throw err;
        }
      }
    }
  }

  throw new Error("Update failed: no valid endpoint");
}

export const deleteActiveWeek = async () => {
  return httpClient('/weeks/active', {
    method: 'DELETE',
  });
};

export const fetchActiveWeekDays = async () => {
  const week = await fetchActiveWeek();
  return week?.days ?? week?.weekDays ?? week?.weeklyPlan ?? [];
};

export const fetchActiveShoppingItems = async () => {
  const week = await fetchActiveWeek();
  const items = week?.shoppingItems ?? week?.shoppingList ?? [];
  return items.map(normalizeShoppingItem);
};

export async function setShoppingItemChecked({ itemId, checked }) {
  const response = await httpClient.patch(`/weeks/active/shopping-items/${itemId}`, {
  isChecked: checked,
});

  return response?.data ?? response;
}
export const updateShoppingItemDetails = async (item) => {
  return httpClient.put(`/weeks/active/shopping-items/${item.id}`, {
      name: item.name,
      quantity: item.quantity,
      category: item.category,
  });
}

export async function deleteShoppingItem(itemId) {
  const response = await httpClient.delete(`/weeks/active/shopping-items/${itemId}`)

  return response?.data ?? response;
}