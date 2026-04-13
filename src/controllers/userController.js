/**
 * controllers/userController.js
 * FR-04: Profile view + update.
 */

const User = require('../models/User');

// GET /user/profile (and /api/v1/users/profile)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// PUT /user/profile (and /api/v1/users/profile)
exports.updateProfile = async (req, res) => {
  // Block email/phone changes completely post-registration
  if (req.body.email !== undefined || req.body.phone !== undefined) {
    return res.status(400).json({ message: 'Field not updatable post-registration' });
  }

  try {
    const allowedFields = ['name', 'area', 'avatarUrl'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /user/points (Month 3 placeholder)
exports.getPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('ecoPoints totalCo2Saved');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({
      ecoPoints: user.ecoPoints,
      totalCo2Saved: user.totalCo2Saved,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /user/badges (Month 4 placeholder)
exports.getBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('badgesEarned');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ badges: user.badgesEarned });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

