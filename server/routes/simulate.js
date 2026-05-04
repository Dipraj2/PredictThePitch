/**
 * routes/simulate.js
 * ──────────────────
 * POST /api/simulate
 *
 * Uses optionalAuth — the sandbox works for ALL users (logged in or not).
 * If a valid Supabase token is present, req.user is populated and
 * the simulation result is saved to the DB. Otherwise req.user = null
 * and the simulation still runs without saving history.
 */
import { Router } from 'express';
import { simulate } from '../controllers/simulateController.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = Router();

router.post('/', optionalAuth, simulate);

export default router;
