// backend/controllers/userController.js
import {
  getUserById,
  updateNotificationPreference,
  completeOnboarding,
  updateHouseholdProfile,
} from "../services/userService.js";

const ALLOWED_NOTIFICATION_PREFERENCES = ["sofort", "täglich", "nie"];
const ALLOWED_HOUSEHOLD_TYPES = ["single", "paar", "familie"];

export async function getMe(req, res) {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User nicht gefunden" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateSettings(req, res) {
  try {
    const { notificationPreference } = req.body;

    if (!ALLOWED_NOTIFICATION_PREFERENCES.includes(notificationPreference)) {
      return res.status(400).json({ error: "Ungültige Benachrichtigungseinstellung" });
    }

    await updateNotificationPreference(req.user.id, notificationPreference);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateOnboarding(req, res) {
  try {
    const { householdType, childrenCount } = req.body;

    if (!ALLOWED_HOUSEHOLD_TYPES.includes(householdType)) {
      return res.status(400).json({ error: "Ungültiger Haushaltstyp" });
    }

    if (householdType === "family") {
      const count = Number(childrenCount);
      if (!Number.isInteger(count) || count < 1 || count > 12) {
        return res.status(400).json({ error: "Ungültige Kinderanzahl" });
      }
    }

    await completeOnboarding(req.user.id, { householdType, childrenCount });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateHouseholdSettings(req, res) {
  try {
    const { householdType, childrenCount } = req.body;

    if (!ALLOWED_HOUSEHOLD_TYPES.includes(householdType)) {
      return res.status(400).json({ error: "Ungültiger Haushaltstyp" });
    }

    const safeChildrenCount = householdType === "familie" ? Number(childrenCount) : 0;

    if (householdType === "familie") {
      if (!Number.isInteger(safeChildrenCount) || safeChildrenCount < 1 || safeChildrenCount > 12) {
        return res.status(400).json({ error: "Ungültige Kinderanzahl" });
      }
    }

    await updateHouseholdProfile(req.user.id, {
      householdType,
      childrenCount: safeChildrenCount,
    });

    res.json({
      success: true,
      data: {
        householdType,
        childrenCount: safeChildrenCount,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
