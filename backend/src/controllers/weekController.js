import {
  createActiveWeek,
  getActiveWeek,
  clearActiveWeek,
  updateShoppingItemStatus,
  deleteShoppingItem,
  updateShoppingItemDetails
} from '../services/planService.js';

export const createWeek = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const week = await createActiveWeek({
      userId,
      selectedMealIds: req.body.selectedMealIds,
    });

    res.status(201).json({
      message: 'Aktive Woche erfolgreich gespeichert.',
      data: week,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentWeek = async (req, res, next) => {
  try {
    const week = await getActiveWeek(req.user.id);

    res.status(200).json({
      message: week ? 'Aktive Woche gefunden.' : 'Keine aktive Woche vorhanden.',
      data: week,
    });
  } catch (error) {
    next(error);
  }
};

export const updateActiveShoppingItem = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const week = await updateShoppingItemStatus({
      userId,
      itemId: req.params.itemId,
      isChecked: req.body.isChecked,
    });

    res.status(200).json({
      message: 'Einkaufslistenpunkt aktualisiert.',
      data: week,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCurrentWeek = async (req, res, next) => {
  try {
    const result = await clearActiveWeek(req.user.id);
    
    console.log('Delete result:', result); // Debug-Log

    // Erfolgreiche Response
    res.status(200).json({
      success: true,
      message: result.deletedWeeks > 0 
        ? `Woche erfolgreich gelöscht. ${result.deletedShoppingItems} Einkaufsitems und ${result.deletedDays} Tage wurden entfernt.`
        : 'Keine aktive Woche zum Löschen gefunden.',
      data: {
        deletedWeeks: result.deletedWeeks,
        deletedShoppingItems: result.deletedShoppingItems,
        deletedDays: result.deletedDays,
        weekId: result.weekId || null
      }
    });
  } catch (error) {
    console.error('Controller Error:', error);
    next(error);
  }
};

export const deleteActiveShoppingItem = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const week = await deleteShoppingItem({
      userId,
      itemId: req.params.itemId,
    });

    res.status(200).json({
      message: 'Einkaufslistenpunkt gelöscht.',
      data: week,
    });
  } catch (error) {
    next(error);
  }
};


export const updateActiveShoppingItemDetails = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const week = await updateShoppingItemDetails({
      userId,
      itemId: req.params.itemId,
      name: req.body.name,
      quantity: req.body.quantity,
      unit: req.body.unit,
      category: req.body.category,
    });

    res.status(200).json({
      message: 'Einkaufslistenpunkt aktualisiert.',
      data: week,
    });
  } catch (error) {
    next(error);
  }
};