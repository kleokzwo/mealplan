import { sendDailySummary } from "../services/dailySummaryService.js";
import { getAllUsers } from "../db/userQueries.js"; // ← anpassen!

export async function runDailySummary(req, res) {
  try {
    const users = await getAllUsers();

    for (const user of users) {
      await sendDailySummary(user);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Daily summary failed" });
  }
}