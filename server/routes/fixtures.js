/**
 * routes/fixtures.js
 * ──────────────────
 * Express router for fixture-related endpoints.
 */

import { Router } from 'express';
import { getUpcomingFixtures } from '../controllers/fixturesController.js';

const router = Router();

/**
 * GET /api/fixtures/upcoming
 * Returns upcoming UCL knockout fixtures (live or static fallback).
 */
router.get('/upcoming', getUpcomingFixtures);

export default router;
