/**
 * routes/auth.js
 * Authentication routes — Month 2 implementation.
 *
 * SRS FRs: FR-01 (register), FR-02 (OTP), FR-03 (login)
 * Public routes: no JWT required
 * Protected: logout requires valid JWT
 */

const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// ── POST /auth/register (FR-01) ───────────────────────────────────────────────
router.post('/register', [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('phone')
    .matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile number required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], authController.register);

// ── POST /auth/verify-otp (FR-02) ────────────────────────────────────────────
// router.post('/verify-otp', [
//   body('userId').notEmpty().withMessage('userId is required'),
//   body('otp')
//     .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
//     .isNumeric().withMessage('OTP must be numeric'),
// ], authController.verifyOTP);

// ── POST /auth/login (FR-03) ─────────────────────────────────────────────────
router.post('/login', [
  body('password').notEmpty().withMessage('Password is required'),
  body().custom((_, { req }) => {
    if (!req.body.email && !req.body.phone)
      throw new Error('Email or phone number is required');
    return true;
  }),
], authController.login);

// ── POST /auth/forgot-password ───────────────────────────────────────────────
router.post('/forgot-password', [
  body('phone')
    .matches(/^[6-9]\d{9}$/).withMessage('Valid phone number required'),
], authController.forgotPassword);

// ── POST /auth/reset-password ────────────────────────────────────────────────
router.post('/reset-password', [
  body('userId').notEmpty().withMessage('userId is required'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], authController.resetPassword);

// ── POST /auth/logout (protected) ────────────────────────────────────────────
// JWT is stateless — logout just means client deletes the token.
// This endpoint exists for future refresh token invalidation.
router.post('/logout', protect, (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
