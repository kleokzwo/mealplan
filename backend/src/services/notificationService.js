import { sendMail } from "./mailService.js";

function shouldNotify(user) {
  return user.notificationPreference !== "nie";
}

// 🔔 Woche erstellt
export async function notifyWeekCreated(user) {
  if (!shouldNotify(user)) return;

  await sendMail({
    to: user.email,
    subject: "Deine Woche ist bereit 🍽️",
    html: `
      <h2>Dein Wochenplan ist fertig!</h2>
      <p>Deine Einkaufsliste wurde erstellt.</p>
    `,
  });
}

// 🔔 Einkauf geändert
export async function notifyShoppingUpdated(user) {
  if (!shouldNotify(user)) return;

  await sendMail({
    to: user.email,
    subject: "Einkaufsliste aktualisiert 🛒",
    html: `
      <p>Deine Einkaufsliste wurde geändert.</p>
    `,
  });
}