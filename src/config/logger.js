/**
 * config/logger.js
 * Structured logger using Winston.
 *
 * Why not just console.log?
 * - console.log has no log levels (you can't filter errors vs info in production)
 * - Winston writes timestamped, leveled logs that are easier to debug
 * - In production (Vercel), logs go to stdout where they're captured automatically
 *
 * Log levels (low → high): error > warn > info > http > debug
 * In production, only 'warn' and above are shown. In dev, everything shows.
 */

const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf, colorize, errors } = format;

// Custom log line format: [2026-03-19 12:00:00] INFO: Server started on port 5000
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // log full stack traces for Error objects
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),
    // In production, you'd add a file transport or send logs to a service
    // new transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

module.exports = logger;
