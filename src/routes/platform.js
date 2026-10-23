/**
 * routes/platform.js
 * Public platform-wide stats for the marketing landing page.
 * No auth — numbers are aggregate marketing data, nothing per-user.
 * Results are cached in-memory for 5 minutes (landing traffic shouldn't
 * hammer Mongo with countDocuments + aggregations on every visit).
 */
const express = require('express');
const MapMarker = require('../models/MapMarker');
const User = require('../models/User');
const WasteLog = require('../models/WasteLog');

const router = express.Router();

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = { at: 0, data: null };

router.get('/stats', async (req, res) => {
  try {
    if (cache.data && Date.now() - cache.at < CACHE_TTL_MS) {
      return res.status(200).json({ success: true, cached: true, stats: cache.data });
    }

    const [binsMapped, ecoWarriors, pointsAgg, wasteAgg] = await Promise.all([
      MapMarker.countDocuments({ isActive: true }),
      User.countDocuments({}),
      User.aggregate([
        { $group: { _id: null, totalPoints: { $sum: '$ecoPoints' } } },
      ]),
      WasteLog.aggregate([
        {
          $group: {
            _id: null,
            wasteKg: { $sum: '$quantity' },
            logs: { $sum: 1 },
          },
        },
      ]),
    ]);

    const waste = wasteAgg[0] || { wasteKg: 0, logs: 0 };
    const data = {
      binsMapped,
      ecoWarriors,
      totalPoints: pointsAgg[0]?.totalPoints || 0,
      wasteKg: Math.round((waste.wasteKg || 0) * 10) / 10,
      wasteLogs: waste.logs || 0,
    };

    cache = { at: Date.now(), data };
    res.status(200).json({ success: true, cached: false, stats: data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load platform stats' });
  }
});

// Test-only hook to reset the in-memory cache between cases.
router.__resetCache = () => { cache = { at: 0, data: null }; };

module.exports = router;
