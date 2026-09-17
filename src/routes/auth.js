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

const router = express.Router();

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
