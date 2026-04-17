import {
  createActiveWeek,
  getActiveWeek,
  clearActiveWeek,
  updateShoppingItemStatus,
} from '../services/planService.js';

export const createWeek = async (req, res, next) => {
  try {
    const week = await createActiveWeek({
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

export const getCurrentWeek = async (_req, res, next) => {
  try {
    const week = await getActiveWeek();

    res.status(200).json({
      message: week ? 'Aktive Woche gefunden.' : 'Keine aktive Woche vorhanden.',
      data: week,
    });
  } catch (error) {
    next(error);
  }
};

export const updateActiveShoppingItem = async (req, res, next) => {
  try {
    const week = await updateShoppingItemStatus({
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

export const deleteCurrentWeek = async (_req, res, next) => {
  try {
    const result = await clearActiveWeek();

    res.status(200).json({
      message: result.deletedWeeks > 0 ? 'Aktive Woche gelöscht.' : 'Keine aktive Woche zum Löschen gefunden.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
