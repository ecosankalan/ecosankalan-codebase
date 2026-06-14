/**
 * routes/users.js — User profile routes (Month 2)
 */
const express = require('express');
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');
const uploadAvatar = require('../middleware/avatarUpload');
const router = express.Router();

const stub = (routeName) => (req, res) => {
  res.status(501).json({
    success: false,
    message: `${routeName} not yet implemented.`,
  });
};

// All user routes require authentication
router.use(protect);

router.get('/profile', userController.getProfile);   // FR-04
router.put('/profile', userController.updateProfile); // FR-04
router.put('/profile/avatar', uploadAvatar, userController.uploadAvatar);
router.get('/points', userController.getPoints);      // Month 3
router.get('/badges', userController.getBadges);      // Month 4

module.exports = router;
