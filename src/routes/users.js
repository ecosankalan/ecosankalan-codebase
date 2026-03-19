/**
 * routes/users.js — User profile routes (Month 2)
 */
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

const stub = (routeName) => (req, res) => {
  res.status(501).json({
    success: false,
    message: `${routeName} not yet implemented.`,
  });
};

// All user routes require authentication
router.use(protect);

router.get('/profile', stub('GET /users/profile'));          // Month 2
router.put('/profile', stub('PUT /users/profile'));          // Month 2
router.get('/points', stub('GET /users/points'));            // Month 3
router.get('/badges', stub('GET /users/badges'));            // Month 4

module.exports = router;
