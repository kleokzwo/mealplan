import { getPreferences, savePreferences } from '../services/preferenceService.js';

export const getAppPreferences = async (_req, res, next) => {
  try {
    const preferences = await getPreferences();

    res.status(200).json({
      message: 'Einstellungen geladen.',
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppPreferences = async (req, res, next) => {
  try {
    const preferences = await savePreferences(req.body || {});

    res.status(200).json({
      message: 'Einstellungen gespeichert.',
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};
