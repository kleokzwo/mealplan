import { sendMail } from "./mailService.js";
import { getTodayMeals, getOpenShoppingItems } from "../config/queries.js"; // ← anpassen!

export async function sendDailySummary(user) {
  if (user.notificationPreference === "nie") return;

  const activeWeek = await getActiveWeekForUser();
  const items = await getOpenShoppingItems();

  const planningHtml = activeWeek
    ? "<li>Deine Woche ist geplant ✅</li>"
    : "<li>Deine Woche ist noch nicht geplant ⚠️</li>";

  const itemsHtml = items.length
    ? `<li>${items.length} offene Einkaufs-Punkte 🛒</li>`
    : "<li>Einkauf erledigt ✅</li>";

  await sendMail({
    to: user.email,
    subject: "Dein Tag im Überblick ☀️",
    html: `
      <h2>Guten Morgen!</h2>
      <ul>
        ${planningHtml}
        ${itemsHtml}
      </ul>
    `,
  });
}