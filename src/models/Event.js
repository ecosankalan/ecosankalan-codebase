const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
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
    address: {
      type: String,
      required: [true, 'Event address is required'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates are required'],
      },
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    organiser: {
      type: String,
      required: [true, 'Organiser is required'],
      trim: true,
    },
    rsvpList: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    bonusPoints: {
      type: Number,
      default: 50,
      min: [0, 'Bonus points cannot be negative'],
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

eventSchema.index({ location: '2dsphere' });
eventSchema.index({ eventDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
