/**
 * routes/users.js
 * User profile routes — Month 2 implementation.
 * SRS FR-04: profile view and update.
 */

const express = require('express');
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');
const uploadAvatar = require('../middleware/avatarUpload');
const router = express.Router();

// All routes here require a valid JWT
router.use(protect);

router.get('/profile', userController.getProfile);   // FR-04
router.put('/profile', userController.updateProfile); // FR-04
router.put('/profile/avatar', uploadAvatar, userController.uploadAvatar);
router.get('/points', userController.getPoints);      // Month 3
router.get('/badges', userController.getBadges);      // Month 4

module.exports = router;