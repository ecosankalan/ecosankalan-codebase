/**
 * controllers/userController.js
 * FR-04: Profile view + update.
 */

const User = require('../models/User');
const getCloudinary = require('../config/cloudinary');

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

// PUT /user/profile/avatar (and /api/v1/users/profile/avatar)
exports.uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Avatar file is required. Use form-data key "avatar".' });
  }

  try {
    const cloudinary = getCloudinary();
    const base64Image = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: process.env.CLOUDINARY_AVATAR_FOLDER || 'ecosankalan/avatars',
      public_id: `user_${req.user.userId}_${Date.now()}`,
      overwrite: true,
      invalidate: true,
      resource_type: 'image',
      transformation: [
        {
          width: 512,
          height: 512,
          crop: 'fill',
          gravity: 'face',
          fetch_format: 'auto',
          quality: 'auto',
        },
      ],
    });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { avatarUrl: uploadResult.secure_url } },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      message: 'Avatar updated successfully',
      avatarUrl: user.avatarUrl,
      user,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message || 'Server error',
    });
  }
};

