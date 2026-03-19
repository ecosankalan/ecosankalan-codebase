/**
 * models/Event.js
 * Community drive events — the social layer of EcoSankalan.
 *
 * Users can:
 *   - Browse upcoming events near them
 *   - RSVP (POST /events/:id/rsvp) → earn bonusPoints
 *   - Get FCM push notification 24h before the event (Month 4)
 *
 * RSVP design decision — why store attendees array inside Event?
 * Max attendees per community event ≈ 50-200 people.
 * That's a small, bounded array — safe to embed.
 * If this were a concert with 10,000 attendees, we'd use a separate
 * Attendance collection instead.
 */

const mongoose = require('mongoose');

// ── RSVP sub-schema ───────────────────────────────────────────────────────────
const rsvpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rsvpAt: {
    type: Date,
    default: Date.now,
  },
  attended: {
    // admin marks true after event — enables attendance badge in future
    type: Boolean,
    default: false,
  },
}, { _id: false });

// ── Main Event Schema ─────────────────────────────────────────────────────────
const eventSchema = new mongoose.Schema(
  {
    // ── Content ───────────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },

    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    imageUrl: {
      type: String,
      default: null,
    },

    // ── Timing ────────────────────────────────────────────────────────────────
    startDate: {
      type: Date,
      required: [true, 'Event start date is required'],
    },

    endDate: {
      type: Date,
      required: [true, 'Event end date is required'],
      validate: {
        validator: function (endDate) {
          return endDate > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },

    // ── Location ──────────────────────────────────────────────────────────────
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number], // [longitude, latitude]
    },

    venue: {
      name:     { type: String, trim: true }, // e.g. "NSUT Open Ground"
      address:  { type: String, trim: true },
      landmark: { type: String, trim: true },
    },

    // ── Gamification ──────────────────────────────────────────────────────────
    bonusPoints: {
      // Eco-points awarded to each user who RSVPs
      // Admin sets this when creating the event
      type: Number,
      default: 50,
      min: [0, 'Bonus points cannot be negative'],
      max: [500, 'Bonus points cannot exceed 500 per event'],
    },

    // ── Capacity & RSVPs ──────────────────────────────────────────────────────
    maxAttendees: {
      type: Number,
      default: null, // null = unlimited
    },

    attendees: [rsvpSchema], // embedded — see design note above

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },

    // ── FCM notification tracking (Month 4) ──────────────────────────────────
    reminderSent: {
      type: Boolean,
      default: false,
      // Set to true after the 24h-before FCM notification is sent
      // Prevents sending duplicate reminders
    },

    // ── Who created it ────────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
eventSchema.index({ location: '2dsphere' });           // geospatial nearby events
eventSchema.index({ startDate: 1, status: 1 });        // GET /events/upcoming
eventSchema.index({ status: 1 });

// ── Virtual: attendee count ────────────────────────────────────────────────────
eventSchema.virtual('attendeeCount').get(function () {
  return this.attendees.length;
});

// ── Virtual: is RSVP open ─────────────────────────────────────────────────────
eventSchema.virtual('isRsvpOpen').get(function () {
  const notFull = !this.maxAttendees || this.attendees.length < this.maxAttendees;
  const notOver = this.status === 'upcoming';
  return notFull && notOver;
});

module.exports = mongoose.model('Event', eventSchema);
