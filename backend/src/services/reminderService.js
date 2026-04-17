// backend/services/reminderService.js
import { sendMail } from "./mailService.js";
import { sendDailySummary } from "./dailySummaryService.js";
import {
  getActiveWeekForUser,
  getOpenShoppingItems,
  getPendingRecipeSuggestionsCount,
} from "../config/queries.js";

function canNotify(user) {
  return user.notificationPreference !== "nie";
}

export async function checkWeeklyPlanningReminder(user) {
  if (!canNotify(user)) return false;

  const activeWeek = await getActiveWeekForUser();

  if (!activeWeek) {
    await sendMail({
      to: user.email,
      subject: "Deine Woche ist noch nicht geplant 🍽️",
      html: `
        <h2>Deine Woche ist noch nicht geplant</h2>
        <p>Schau kurz rein und wähle deine Gerichte aus.</p>
      `,
    });

    return true;
  }

  return false;
}

export async function checkRecipeSelectionReminder(user) {
  if (!canNotify(user)) return false;

  const count = await getPendingRecipeSuggestionsCount(user.id);

  if (count > 0) {
    await sendMail({
      to: user.email,
      subject: "Du hast Vorschläge zur Auswahl 👀",
      html: `
        <h2>Du hast ${count} Vorschläge bereit</h2>
        <p>Wähle kurz aus, dann erstellen wir deine Einkaufsliste automatisch.</p>
      `,
    });

    return true;
  }

  return false;
}

export async function checkShoppingReminder(user) {
  if (!canNotify(user)) return false;

  const items = await getOpenShoppingItems();

  if (items.length > 0) {
    await sendMail({
      to: user.email,
      subject: "Deine Einkaufsliste ist noch offen 🛒",
      html: `
        <h2>Einkauf noch offen</h2>
        <p>Du hast noch ${items.length} offene Punkte.</p>
      `,
    });

    return true;
  }

  return false;
}

export async function runDailyNotifications(user) {
  if (!canNotify(user)) return;

  if (user.notificationPreference === "täglich") {
    await sendDailySummary(user);
    return;
  }

  await checkWeeklyPlanningReminder(user);
  await checkRecipeSelectionReminder(user);
  await checkShoppingReminder(user);
}