const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Bin = require('../models/Bin');

const router = express.Router();

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const distanceMetres = ([lng1, lat1], [lng2, lat2]) => {
  const radius = 6371000;
  const toRad = (degrees) => degrees * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// FR-12: GET /bins?lat&lng&radius — sorted nearest-first using $near + $2dsphere
router.get('/', async (req, res) => {
  try {
    const lat = toNumber(req.query.lat);
    const lng = toNumber(req.query.lng);
    const radius = toNumber(req.query.radius) || 5000;

    if (lat === null || lng === null) {
      return res.status(400).json({ success: false, message: 'lat and lng query params are required' });
    }

    const userPoint = [lng, lat];
    const bins = await Bin.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: userPoint },
          $maxDistance: radius,
        },
      },
    }).lean();

    res.status(200).json(bins.map((bin) => ({
      ...bin,
      distanceMetres: distanceMetres(userPoint, bin.location.coordinates),
    })));
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load bins' });
  }
});

// FR-11: POST /bins — Admin-only bin creation
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, address, location, types, capacityStatus } = req.body;

    if (!name || !address || !location?.coordinates || !Array.isArray(types) || types.length === 0) {
      return res.status(400).json({ success: false, message: 'name, address, location.coordinates and types are required' });
    }

    const bin = await Bin.create({
      name,
      address,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
      types,
      capacityStatus,
      createdBy: req.user.userId,
    });

    res.status(201).json(bin);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to create bin' });
  }
});

router.put('/:id', protect, authorize('admin'), (req, res) => {
  res.status(501).json({ success: false, message: 'PUT /bins/:id not implemented.' });
});

router.delete('/:id', protect, authorize('admin'), (req, res) => {
  res.status(501).json({ success: false, message: 'DELETE /bins/:id not implemented.' });
});

module.exports = router;
