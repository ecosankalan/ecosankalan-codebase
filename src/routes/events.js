const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');

const router = express.Router();

const publicEvent = (event) => {
  const eventObject = event.toObject ? event.toObject() : event;
  const rsvpCount = eventObject.rsvpList?.length || 0;
  delete eventObject.rsvpList;
  delete eventObject.__v;
  return { ...eventObject, rsvpCount };
};

router.get('/', async (req, res) => {
  res.status(501).json({ success: false, message: 'GET /events coming in Month 4.' });
});

router.get('/upcoming', async (req, res) => {
  try {
    const events = await Event.find({
      isCancelled: false,
      eventDate: { $gte: new Date() },
    }).sort({ eventDate: 1 }).lean();

    res.status(200).json(events.map(publicEvent));
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load upcoming events' });
  }
});

router.post('/', protect, authorize('admin', 'ngo'), async (req, res) => {
  try {
    const { title, description, address, location, eventDate, organiser, bonusPoints } = req.body;
    const parsedDate = new Date(eventDate);

    if (!title || !description || !address || !location?.coordinates || !organiser || Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: 'title, description, address, location.coordinates, eventDate and organiser are required' });
    }

    if (parsedDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'eventDate must be in the future' });
    }

    const event = await Event.create({
      title,
      description,
      address,
      location: { type: 'Point', coordinates: location.coordinates },
      eventDate: parsedDate,
      organiser,
      bonusPoints,
      createdBy: req.user.userId,
    });

    res.status(201).json(publicEvent(event));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to create event' });
  }
});

router.post('/:id/rsvp', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.isCancelled) return res.status(400).json({ success: false, message: 'Event is cancelled' });
    if (event.eventDate < new Date()) return res.status(400).json({ success: false, message: 'Event is already over' });
    if (event.rsvpList.some((userId) => String(userId) === String(req.user.userId))) {
      return res.status(409).json({ success: false, message: 'Already RSVP’d for this event' });
    }

    const update = await Event.updateOne(
      { _id: event._id, rsvpList: { $ne: req.user.userId } },
      { $addToSet: { rsvpList: req.user.userId } }
    );

    if (update.modifiedCount === 0) {
      return res.status(409).json({ success: false, message: 'Already RSVP’d for this event' });
    }

    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { ecoPoints: event.bonusPoints, totalPointsEarned: event.bonusPoints },
    });

    res.status(200).json({
      success: true,
      message: 'RSVP confirmed',
      pointsAwarded: event.bonusPoints,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to RSVP for event' });
  }
});

router.put('/:id', protect, authorize('admin'), (req, res) => {
  res.status(501).json({ success: false, message: 'PUT /events/:id coming in Month 4.' });
});

router.delete('/:id', protect, authorize('admin'), (req, res) => {
  res.status(501).json({ success: false, message: 'DELETE /events/:id coming in Month 4.' });
});

module.exports = router;
