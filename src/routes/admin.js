const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const WasteLog = require('../models/WasteLog');
const Event = require('../models/Event');
const ChallengeProgress = require('../models/ChallengeProgress');
const Voucher = require('../models/Voucher');

const router = express.Router();

let statsCache = {
  expiresAt: 0,
  data: null,
};

const round2 = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

router.use(protect, authorize('admin'));

router.post('/vouchers', async (req, res) => {
  try {
    const vouchers = Array.isArray(req.body) ? req.body : req.body.vouchers;
    if (!Array.isArray(vouchers) || vouchers.length === 0) {
      return res.status(400).json({ success: false, message: 'Voucher array is required' });
    }

    const result = await Voucher.insertMany(vouchers, { ordered: false }).catch((err) => {
      if (err?.writeErrors) {
        return {
          insertedDocs: err.insertedDocs || [],
          writeErrors: err.writeErrors,
        };
      }
      throw err;
    });

    const insertedCount = Array.isArray(result) ? result.length : result.insertedDocs.length;
    const duplicateCount = Array.isArray(result)
      ? 0
      : result.writeErrors.filter((error) => error.code === 11000).length;

    res.status(201).json({
      insertedCount,
      duplicateCount,
      skippedCount: vouchers.length - insertedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to import vouchers' });
  }
});

router.get('/vouchers/stats', async (req, res) => {
  try {
    const stats = await Voucher.aggregate([
      {
        $group: {
          _id: '$partnerName',
          totalIssued: { $sum: 1 },
          totalAssigned: { $sum: { $cond: [{ $ne: ['$assignedTo', null] }, 1, 0] } },
          remaining: { $sum: { $cond: [{ $eq: ['$assignedTo', null] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          partnerName: '$_id',
          totalIssued: 1,
          totalAssigned: 1,
          remaining: 1,
        },
      },
      { $sort: { partnerName: 1 } },
    ]);

    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load voucher stats' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    if (statsCache.data && statsCache.expiresAt > Date.now()) {
      return res.status(200).json(statsCache.data);
    }

    const [totalUsers, wasteTotals, totalEventsConducted, totalChallengeCompletions, vouchersIssuedByPartner] =
      await Promise.all([
        User.countDocuments(),
        WasteLog.aggregate([{ $group: { _id: null, totalWasteKg: { $sum: '$quantity' } } }]),
        Event.countDocuments({ eventDate: { $lt: new Date() }, isCancelled: false }),
        ChallengeProgress.countDocuments({ allCompleted: true }),
        Voucher.aggregate([
          { $match: { assignedTo: { $ne: null } } },
          { $group: { _id: '$partnerName', issued: { $sum: 1 } } },
          { $project: { _id: 0, partnerName: '$_id', issued: 1 } },
          { $sort: { partnerName: 1 } },
        ]),
      ]);

    const data = {
      totalUsers,
      totalWasteKg: round2(wasteTotals[0]?.totalWasteKg),
      totalEventsConducted,
      totalChallengeCompletions,
      vouchersIssuedByPartner,
      openAICostMTD: 0,
    };

    statsCache = {
      data,
      expiresAt: Date.now() + 60 * 1000,
    };

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load admin stats' });
  }
});

module.exports = router;
