/**
 * routes/waste.js — Waste logging routes (Month 3)
 *
 * Eco-points per kg:
 *   e-waste=10, metal=6, plastic=5, paper=4, organic=3, other=2
 */
const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

const stub = (routeName) => (req, res) => {
  res.status(501).json({
    success: false,
    message: `${routeName} not yet implemented. Coming in Month 3.`,
  });
};

router.use(protect);

router.post('/log', stub('POST /waste/log'));            // Manual or AI-assisted log
router.get('/history', stub('GET /waste/history'));      // Filter by date range
router.get('/stats', stub('GET /waste/stats'));          // Aggregated stats for dashboard
router.post('/scan', stub('POST /waste/scan'));          // Gemini Vision AI scan (Month 3)

module.exports = router;
