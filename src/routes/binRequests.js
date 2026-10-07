const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { uploadSinglePhoto } = require('../middleware/upload');
const getCloudinary = require('../config/cloudinary');
const BinRequest = require('../models/BinRequest');
const Bin = require('../models/Bin');
const User = require('../models/User');

const router = express.Router();

// Points awarded to the reporter when a bin request is approved.
const BIN_APPROVAL_POINTS = 50;
// Penalty bounds for fake/duplicate reports.
const MAX_PENALTY_POINTS = 500;

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const parseTypes = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through — treat as single comma-separated value
    }
    return raw.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
};

// POST /bin-requests — submit a new bin report (any logged-in user).
// multipart/form-data: photo (live camera image, required), name, address,
// lat, lng, types (JSON array or comma-separated).
router.post('/', protect, uploadSinglePhoto, async (req, res) => {
  try {
    const { name, address } = req.body;
    const lat = toNumber(req.body.lat);
    const lng = toNumber(req.body.lng);
    const types = parseTypes(req.body.types);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'A live photo of the bin is required.' });
    }
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Bin name is required.' });
    }
    if (!address || !String(address).trim()) {
      return res.status(400).json({ success: false, message: 'Address/landmark is required.' });
    }
    if (lat === null || lng === null || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ success: false, message: 'A valid live location (lat/lng) is required.' });
    }
    if (types.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one bin type is required.' });
    }

    // Upload live photo proof to Cloudinary (same pattern as challenge proofs).
    let photoUrl;
    let photoPublicId = null;
    try {
      const cloudinary = getCloudinary();
      const base64Image = req.file.buffer.toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: `ecosankalan/bin-requests/${req.user.userId}`,
        public_id: `bin_${Date.now()}`,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
        transformation: [
          { width: 1280, height: 1280, crop: 'limit', fetch_format: 'auto', quality: 'auto' },
        ],
      });
      photoUrl = uploadResult.secure_url;
      photoPublicId = uploadResult.public_id;
    } catch (uploadErr) {
      console.log('Bin photo upload failed:', uploadErr?.message);
      return res.status(500).json({ success: false, message: 'Failed to upload bin photo.' });
    }

    const binRequest = await BinRequest.create({
      requestedBy: req.user.userId,
      name: String(name).trim(),
      address: String(address).trim(),
      location: { type: 'Point', coordinates: [lng, lat] },
      types,
      photoUrl,
      photoPublicId,
      status: 'pending',
    });

    res.status(201).json({ success: true, binRequest });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to submit bin request.' });
  }
});

// GET /bin-requests?status=pending — list requests for admin review.
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const filter = ['pending', 'approved', 'rejected'].includes(status) ? { status } : {};
    const requests = await BinRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('requestedBy', 'name email ecoPoints')
      .lean();
    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load bin requests.' });
  }
});

// POST /bin-requests/penalty — deduct points from a user (e.g. fake reports).
// Body: { userId, points, reason? }
// NOTE: defined before /:id routes so "penalty" is never captured as an :id.
router.post('/penalty', protect, authorize('admin'), async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    const amount = Math.floor(Number(points));

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required.' });
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_PENALTY_POINTS) {
      return res.status(400).json({ success: false, message: `points must be between 1 and ${MAX_PENALTY_POINTS}.` });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Floor at 0 — a penalty never drives balances negative.
    user.ecoPoints = Math.max(0, (user.ecoPoints || 0) - amount);
    user.totalPointsEarned = Math.max(0, (user.totalPointsEarned || 0) - amount);
    await user.save();

    res.status(200).json({
      success: true,
      message: `Penalty applied: -${amount} points${reason ? ` (${reason})` : ''}.`,
      userPoints: { ecoPoints: user.ecoPoints, totalPointsEarned: user.totalPointsEarned },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to apply penalty.' });
  }
});

// POST /bin-requests/:id/approve — create the Bin (appears on the map) + award points.
router.post('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const binRequest = await BinRequest.findById(req.params.id);
    if (!binRequest) {
      return res.status(404).json({ success: false, message: 'Bin request not found.' });
    }
    if (binRequest.status !== 'pending') {
      return res.status(409).json({ success: false, message: `Request already ${binRequest.status}. Points were awarded only once.` });
    }

    const bin = await Bin.create({
      name: binRequest.name,
      address: binRequest.address,
      location: {
        type: 'Point',
        coordinates: binRequest.location.coordinates,
      },
      types: binRequest.types,
      createdBy: binRequest.requestedBy,
    });

    const updatedUser = await User.findByIdAndUpdate(
      binRequest.requestedBy,
      { $inc: { ecoPoints: BIN_APPROVAL_POINTS, totalPointsEarned: BIN_APPROVAL_POINTS } },
      { new: true, runValidators: false }
    ).select('ecoPoints totalPointsEarned');

    binRequest.status = 'approved';
    binRequest.reviewedBy = req.user.userId;
    binRequest.reviewedAt = new Date();
    binRequest.pointsAwarded = BIN_APPROVAL_POINTS;
    await binRequest.save();

    res.status(200).json({
      success: true,
      message: `Bin approved. +${BIN_APPROVAL_POINTS} points awarded.`,
      bin,
      pointsAwarded: BIN_APPROVAL_POINTS,
      userPoints: updatedUser
        ? { ecoPoints: updatedUser.ecoPoints, totalPointsEarned: updatedUser.totalPointsEarned }
        : null,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to approve bin request.' });
  }
});

// POST /bin-requests/:id/reject — reject with optional reason (no points, no bin).
router.post('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const binRequest = await BinRequest.findById(req.params.id);
    if (!binRequest) {
      return res.status(404).json({ success: false, message: 'Bin request not found.' });
    }
    if (binRequest.status !== 'pending') {
      return res.status(409).json({ success: false, message: `Request already ${binRequest.status}.` });
    }

    binRequest.status = 'rejected';
    binRequest.reviewedBy = req.user.userId;
    binRequest.reviewedAt = new Date();
    binRequest.rejectReason = typeof req.body?.reason === 'string'
      ? req.body.reason.slice(0, 500)
      : null;
    await binRequest.save();

    res.status(200).json({ success: true, message: 'Bin request rejected.', binRequest });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to reject bin request.' });
  }
});

module.exports = router;
module.exports.BIN_APPROVAL_POINTS = BIN_APPROVAL_POINTS;
