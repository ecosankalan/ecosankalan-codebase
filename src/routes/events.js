/**
 * routes/events.js — Community drive events (Month 4)
 */
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
const stub = (n) => (req, res) => res.status(501).json({ success: false, message: `${n} coming in Month 4.` });

router.get('/', stub('GET /events'));
router.get('/upcoming', stub('GET /events/upcoming'));
router.post('/', protect, authorize('admin'), stub('POST /events'));
router.post('/:id/rsvp', protect, stub('POST /events/:id/rsvp'));  // Awards bonus eco-points
router.put('/:id', protect, authorize('admin'), stub('PUT /events/:id'));
router.delete('/:id', protect, authorize('admin'), stub('DELETE /events/:id'));

module.exports = router;
