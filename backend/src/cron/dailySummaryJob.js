// backend/cron/dailySummaryJob.js
import cron from "node-cron";
import { getAllUsers } from "../config/userQueries.js";
import { runDailyNotifications } from "../services/reminderService.js";

export function startDailySummaryJob() {
  cron.schedule(
    "0 8 * * *",
    async () => {
      console.log("⏰ Running daily notifications...");

      const users = await getAllUsers();

      for (const user of users) {
        try {
          await runDailyNotifications(user);
        } catch (err) {
          console.error(`Daily notification error for user ${user.id}:`, err);
        }
      }
    },
    {
      timezone: "Europe/Berlin",
    }
  );
}