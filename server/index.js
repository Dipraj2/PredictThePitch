/**
 * server/index.js
 * ───────────────
 * Entry point for the PredictThePitch Node.js middleware.
 *
 * Responsibilities:
 *  - Serve live UCL fixture data from football-data.org (with static fallback)
 *  - CORS-enabled so the Vite dev server (port 5173) can call it freely
 *
 * Start:  node index.js  (or: npm run dev)
 * Port:   3001 (override with PORT env var)
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fixturesRouter from './routes/fixtures.js';
import simulateRouter from './routes/simulate.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/fixtures', fixturesRouter);
app.use('/api/simulate', simulateRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  PredictThePitch middleware running on http://localhost:${PORT}`);
  console.log(`    GET  http://localhost:${PORT}/api/fixtures/upcoming`);
  console.log(`    POST http://localhost:${PORT}/api/simulate`);
});
