import {
  notifyWeekCreated,
  notifyShoppingUpdated,
} from "../services/notificationService.js";
import { runDailyNotifications } from "../services/reminderService.js";
import { getUserById } from "../services/userService.js";

// 🔔 manuell triggern (debug / testing)
export async function triggerWeekMail(req, res) {
  try {
    const user = req.user;

    await notifyWeekCreated(user);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send mail" });
  }
}

export async function triggerShoppingMail(req, res) {
  try {
    const user = req.user;

    await notifyShoppingUpdated(user);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send mail" });
  }
}

export async function triggerDailyNotifications(req, res) {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User nicht gefunden" });
    }

    await runDailyNotifications(user);

    res.json({ success: true });
  } catch (err) {
    console.error("triggerDailyNotifications ERROR:", err);
    res.status(500).json({
      error: "Notifications konnten nicht gesendet werden",
      details: err.message,
    });
  }
}