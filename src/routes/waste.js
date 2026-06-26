const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const WasteLog = require('../models/WasteLog');
const User = require('../models/User');
const { uploadAiImages } = require('../middleware/upload');
const { scanWaste } = require('../controllers/aiScanController');

const router = express.Router();

const categoryKeys = ['plastic', 'organic', 'eWaste', 'metal', 'paper', 'other'];

const getRangeStart = (range) => {
  if (range === 'all') return null;
  const days = range === 'month' ? 30 : 7;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

const round2 = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const normaliseCategory = (category) => (category === 'e-waste' ? 'eWaste' : category);

router.use(protect);

// POST /waste/log — manual waste logging
router.post('/log', async (req, res) => {
  try {
    const { category, quantity, unit = 'kg', description, logMethod = 'manual' } = req.body;

    if (!category || !quantity) {
      return res.status(400).json({ success: false, message: 'category and quantity are required' });
    }

    const validCategories = ['plastic', 'paper', 'metal', 'organic', 'e-waste', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: `category must be one of: ${validCategories.join(', ')}` });
    }

    const qty = parseFloat(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'quantity must be a positive number' });
    }

    const kgQty = unit === 'g' ? qty / 1000 : qty;
    const pointsPerKg = WasteLog.POINTS_PER_KG[category] || 2;
    const co2PerKg = WasteLog.CO2_PER_KG[category] || 0.3;
    const pointsEarned = Math.round(pointsPerKg * kgQty);
    const co2Saved = round2(co2PerKg * kgQty);

    const log = await WasteLog.create({
      userId: req.user.userId,
      category,
      quantity: qty,
      unit,
      description,
      logMethod,
      pointsEarned,
      co2Saved,
    });

    // Atomically credit points to the user
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: {
        ecoPoints: pointsEarned,
        totalPointsEarned: pointsEarned,
        totalWasteLogged: kgQty,
      },
    });

    res.status(201).json({
      success: true,
      log,
      pointsEarned,
      co2Saved,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to log waste' });
  }
});

// GET /waste/history — paginated waste history for logged-in user
router.get('/history', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const category = req.query.category;

    const match = { userId: new mongoose.Types.ObjectId(req.user.userId) };
    if (category) match.category = category;

    const [logs, total] = await Promise.all([
      WasteLog.find(match).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      WasteLog.countDocuments(match),
    ]);

    res.status(200).json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load waste history' });
  }
});

// GET /waste/stats — aggregated stats with range param (week/month/all)
router.get('/stats', async (req, res) => {
  try {
    const range = ['week', 'month', 'all'].includes(req.query.range)
      ? req.query.range
      : 'week';
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const match = { userId };
    const startDate = getRangeStart(range);

    if (startDate) {
      match.createdAt = { $gte: startDate };
    }

    const kgExpression = {
      $cond: [{ $eq: ['$unit', 'g'] }, { $divide: ['$quantity', 1000] }, '$quantity'],
    };

    const [totals, categories, trend] = await Promise.all([
      WasteLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalKg: { $sum: kgExpression },
            totalCo2Saved: { $sum: '$co2Saved' },
            totalPointsEarned: { $sum: '$pointsEarned' },
          },
        },
      ]),
      WasteLog.aggregate([
        { $match: match },
        { $group: { _id: '$category', kg: { $sum: kgExpression } } },
      ]),
      WasteLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
                timezone: 'Asia/Kolkata',
              },
            },
            kg: { $sum: kgExpression },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const categoryBreakdown = categoryKeys.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});

    categories.forEach((item) => {
      const key = normaliseCategory(item._id);
      if (categoryBreakdown[key] !== undefined) {
        categoryBreakdown[key] = round2(item.kg);
      }
    });

    const total = totals[0] || {};

    res.status(200).json({
      totalKg: round2(total.totalKg),
      totalCo2Saved: round2(total.totalCo2Saved),
      totalPointsEarned: round2(total.totalPointsEarned),
      categoryBreakdown,
      weeklyTrend: trend.map((item) => ({
        date: item._id,
        kg: round2(item.kg),
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load waste stats' });
  }
});

// POST /waste/scan — AI waste image scan (also aliased from /api/v1/ai/analyze)
router.post('/scan', uploadAiImages, scanWaste);

module.exports = router;
