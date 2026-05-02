import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { testConnection } from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import mealSuggestionRoutes from './routes/mealSuggestionRoutes.js';
import planRoutes from './routes/planRoutes.js';
import weekRoutes from './routes/weekRoutes.js';
import preferenceRoutes from './routes/preferenceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { startDailySummaryJob } from "./cron/dailySummaryJob.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from './routes/userRoutes.js';
import { notFoundHandler, errorHandler } from './middlewares/errorMiddleware.js';
import testRoutes from './routes/testRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

startDailySummaryJob();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    message: 'Familien-Autopilot API läuft.',
  });
});

app.set('etag', false);

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

if (process.env.NODE_ENV !== 'production') {
  app.use('/api/test', testRoutes);
}

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/meal-suggestions', mealSuggestionRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/weeks', weekRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`Server läuft auf http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Serverstart fehlgeschlagen:', error.message);
    process.exit(1);
  }
};

startServer();