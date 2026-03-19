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
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', (req, res) => {
  // mongoose.connection.readyState values:
  //   0 = disconnected | 1 = connected | 2 = connecting | 3 = disconnecting
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = dbStates[mongoose.connection.readyState] || 'unknown';

  const status = {
    success: true,
    project: 'EcoSankalan',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    server: 'running',
    database: dbState,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  };

  // Return 200 if DB is connected, 503 (Service Unavailable) if not
  const httpStatus = dbState === 'connected' ? 200 : 503;
  res.status(httpStatus).json(status);
});

module.exports = router;
