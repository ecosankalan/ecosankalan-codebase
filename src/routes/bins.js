/**
 * routes/bins.js — Recycling bin map routes (Month 4)
 * Geospatial: $near queries on MongoDB 2dsphere index
 */
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
const stub = (n) => (req, res) => res.status(501).json({ success: false, message: `${n} coming in Month 4.` });

router.get('/', stub('GET /bins?lat&lng&radius'));       // Find bins near location
router.post('/', protect, authorize('admin'), stub('POST /bins'));
router.put('/:id', protect, authorize('admin'), stub('PUT /bins/:id'));
router.delete('/:id', protect, authorize('admin'), stub('DELETE /bins/:id'));

module.exports = router;
