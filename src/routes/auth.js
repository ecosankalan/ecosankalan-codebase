/**
 * routes/auth.js
 * Authentication routes — Appwrite integration.
 *
 * Appwrite handles:
 *   - User registration (email/password, Google OAuth)
 *   - User login (email/password, Google OAuth)
 *   - Session management
 *   - Password recovery
 *
 * This file handles:
 *   - POST /sync — Find or create MongoDB user from Appwrite identity
 *   - GET /me — Return current MongoDB user profile
 */

const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { sendMail } = require('../services/mailer');
const { welcomeEmail } = require('../services/emailTemplates');

const router = express.Router();

// Best-effort "welcome once" dedupe — avoids double-sending when the
// frontend syncs twice in quick succession (StrictMode / OAuth retries).
const welcomedIds = new Set();

// Admin bootstrap: comma-separated emails promoted to admin on sync.
// Example: ADMIN_EMAILS=teammate1@example.com,teammate2@example.com
const adminEmails = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

/**
 * POST /api/v1/auth/sync
 * Protected. Called by the frontend after Appwrite authentication.
 *
 * Finds or creates the MongoDB user matching the Appwrite identity.
 * Returns the full MongoDB user profile.
 */
router.post('/sync', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Promote configured admin emails without a redeploy-time code change.
    if (adminEmails().includes(String(user.email || '').toLowerCase()) && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }
    // Welcome mail for brand-new profiles (fire-and-forget — never blocks login).
    try {
      const ageMs = Date.now() - new Date(user.createdAt).getTime();
      const uid = String(user._id);
      if (ageMs < 120000 && !welcomedIds.has(uid) && user.email) {
        welcomedIds.add(uid);
        const base = (process.env.CLIENT_URL || '').replace(/\/$/, '');
        sendMail({
          to: user.email,
          ...welcomeEmail({ name: user.name, dashboardUrl: base ? `${base}/dashboard` : undefined }),
        }).catch(() => {});
      }
    } catch { /* mail must never break sync */ }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Auth sync error:', error);
    return res.status(500).json({ success: false, message: 'Server error during sync' });
  }
});

/**
 * GET /api/v1/auth/me
 * Protected. Returns the current authenticated user's MongoDB profile.
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Auth me error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
