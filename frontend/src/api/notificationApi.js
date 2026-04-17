import { httpClient } from "./httpClient";

// 🔔 Test: Woche Mail
export async function triggerWeekNotification() {
  return httpClient.post("/notifications/test/week");
}

// 🔔 Test: Shopping Mail
export async function triggerShoppingNotification() {
  return httpClient.post("/notifications/test/shopping");
}

// 🔔 Daily Summary manuell triggern
export async function triggerDailySummary() {
  return httpClient.post("/daily-summary/run");
}