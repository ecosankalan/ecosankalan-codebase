/**
 * app.js
 * Express application factory.
 *
 * Why separate app.js from server.js?
 * - server.js just starts the HTTP listener (node concern)
 * - app.js defines the Express app (testable without a running server)
 * - Tests can import app.js directly without binding to a port
 *
 * Middleware order matters in Express:
 *   1. Security headers (helmet)  ← always first
 *   2. CORS                       ← before any route
 *   3. Body parsers               ← before controllers read req.body
 *   4. Logging (morgan)           ← after body parsers, before routes
 *   5. Rate limiting              ← before routes to block abuse
 *   6. Routes                     ← the actual business logic
 *   7. 404 handler                ← after all routes, catches missed ones
 *   8. Error handler              ← always last
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Route imports
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const wasteRoutes = require('./routes/waste');
const binRoutes = require('./routes/bins');
const eventRoutes = require('./routes/events');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const challengeRoutes = require('./routes/challenges');
const voucherRoutes = require('./routes/vouchers');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
// Middleware imports
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ─────────────────────────────────────────────────
// 1. SECURITY HEADERS (helmet)
// Sets ~15 HTTP headers to protect against common web vulnerabilities:
//   - X-Frame-Options: prevents clickjacking
//   - X-XSS-Protection: XSS filter
//   - Strict-Transport-Security: forces HTTPS
//   - Content-Security-Policy: prevents code injection
// ─────────────────────────────────────────────────
app.use(helmet());

// ─────────────────────────────────────────────────
// 2. CORS (Cross-Origin Resource Sharing)
// Browsers block requests from a different origin by default.
// This tells the browser "yes, our API allows requests from these origins."
// ─────────────────────────────────────────────────
// Supports:
// - CLIENT_URL (single origin, per task acceptance criteria)
// - ALLOWED_ORIGINS (comma-separated, existing setup)
const allowedOrigins = [
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000']
  ),
]
  .map((o) => (o || '').trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, mobile apps)
      // Or if we are in development mode, allow anything!
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true, // allow cookies/auth headers cross-origin
  })
);

// ─────────────────────────────────────────────────
// 3. BODY PARSERS
// Without these, req.body is undefined.
// ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));       // parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // parse form data

// ─────────────────────────────────────────────────
// 4. COMPRESSION
// Gzip responses — reduces payload size ~70% for JSON APIs
// ─────────────────────────────────────────────────
app.use(compression());

// ─────────────────────────────────────────────────
// 5. HTTP REQUEST LOGGING (morgan)
// Logs: POST /auth/login 200 42ms
// 'dev' format in development, 'combined' (Apache format) in production
// ─────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─────────────────────────────────────────────────
// 6. RATE LIMITING
// Prevents brute-force attacks and API abuse.
// Default: 100 requests per 15 minutes per IP.
// Auth routes get a stricter limiter (defined in auth routes in Month 2).
// ─────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,  // include rate limit info in response headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
});

app.use('/api', globalLimiter);

// ─────────────────────────────────────────────────
// 7. ROUTES
// All API routes are prefixed with /api/v1
// Versioning (/v1) means we can release /v2 without breaking existing clients
// ─────────────────────────────────────────────────

app.use('/health', healthRoutes);               // GET /health — no version prefix
app.use('/api/v1/auth', authRoutes);            // Month 2
app.use('/api/v1/users', userRoutes);           // Month 2
app.use('/api/v1/user', userRoutes);            // Alias (singular)
app.use('/auth', authRoutes);                   // Alias (unversioned)
app.use('/user', userRoutes);                   // Alias (unversioned)
app.use('/api/v1/waste', wasteRoutes);          // Month 3
app.use('/api/v1/bins', binRoutes);             // Month 4
app.use('/api/v1/events', eventRoutes);         // Month 4
app.use('/api/v1/products', productRoutes);     // Month 5
app.use('/api/v1/orders', orderRoutes);         // Month 5
app.use('/api/v1/challenges', challengeRoutes); // Month 4
app.use('/api/v1/vouchers', voucherRoutes);     // Month 5
app.use('/api/v1/admin', adminRoutes);          // Month 6
app.use('/api/v1/ai', aiRoutes);                // AI waste scan

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🌿 EcoSankalan API is running',
    version: '1.0.0',
    docs: '/health',
    project: 'NSUT CPVS-STP 2025-26(E)',
  });
});

// ─────────────────────────────────────────────────
// 8. 404 & ERROR HANDLERS (always last)
// ─────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
