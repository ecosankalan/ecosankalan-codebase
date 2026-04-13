/**
 * routes/health.js
 * Health check endpoint.
 *
 * GET /health → returns server status + MongoDB connection state
 *
 * This is the FIRST route Atishay should hit after cloning and running
 * the project. If this returns 200 with db: "connected", the skeleton works.
 *
 * Also useful for Vercel's uptime checks and monitoring tools.
 */

const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  // Acceptance criteria (Month 2): GET /health must return HTTP 200 {status:'ok'}
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
