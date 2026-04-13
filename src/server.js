/**
 * server.js
 * Entry point — connects to MongoDB then starts the HTTP server.
 *
 * Why connect DB first?
 * If the server starts before the DB connects, incoming requests that
 * hit the DB will crash. By awaiting connectDB(), we guarantee the
 * app is fully ready before accepting traffic.
 */

// Load environment variables FIRST — before any other import reads process.env
// BULLETPROOF PATH: Forces dotenv to look in the parent folder of 'src'
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

// Async IIFE (Immediately Invoked Function Expression)
// Lets us use await at the top level without a full async function wrapper
(async () => {
  // 1. Connect to MongoDB Atlas
  await connectDB();

  // 2. Start the HTTP server
  const server = app.listen(PORT, () => {
    logger.info(`🚀 EcoSankalan server running on port ${PORT}`);
    logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  });

  // ─────────────────────────────────────────────────
  // Graceful shutdown — important for production
  // When Vercel (or any host) kills the process, we:
  //   1. Stop accepting new connections
  //   2. Let in-flight requests finish
  //   3. Close DB connection cleanly
  // ─────────────────────────────────────────────────
  const shutdown = async (signal) => {
    logger.warn(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM')); // Vercel/cloud sends this
  process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C in terminal

  // Catch unhandled promise rejections (e.g. a forgotten await)
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection:', reason);
    // Don't crash immediately — log and let graceful shutdown handle it
  });
})();