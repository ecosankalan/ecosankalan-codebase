/**
 * routes/auth.js
 * Authentication routes — stubs for Month 2 implementation.
 *
 * These routes are intentionally stubbed (returning 501 Not Implemented)
 * so the folder structure is in place for Month 2. Atishay can see the
 * API surface area and plan accordingly.
 *
 * Month 2 will implement:
 *   POST /auth/register  → create user, send OTP via MSG91
 *   POST /auth/verify-otp → verify OTP, issue JWT
 *   POST /auth/login     → login with email+password, issue JWT
 *   POST /auth/refresh   → refresh JWT using refresh token
 *   POST /auth/logout    → invalidate refresh token
 */

const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Stub — will be replaced in Month 2 with full implementation
const stub = (routeName) => (req, res) => {
  res.status(501).json({
    success: false,
    message: `${routeName} not yet implemented. Coming in Month 2.`,
    docs: 'https://github.com/ecosankalan/ecosankalan-codebase/wiki',
  });
};

// Public routes (no token needed)
router.post('/register', stub('POST /auth/register'));
router.post('/verify-otp', stub('POST /auth/verify-otp'));
router.post('/login', stub('POST /auth/login'));
router.post('/refresh', stub('POST /auth/refresh'));

// Protected routes (need valid JWT)
router.post('/logout', protect, stub('POST /auth/logout'));

module.exports = router;
