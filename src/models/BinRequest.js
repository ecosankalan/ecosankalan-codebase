const mongoose = require('mongoose');

const BIN_TYPES = ['plastic', 'organic', 'eWaste', 'metal', 'paper', 'general'];

/**
 * BinRequest — a user-submitted "new bin here" report awaiting admin review.
 *
 * Flow:
 *   1. User submits from the map with a live camera photo + live GPS location
 *   2. Admin reviews in the dashboard (photo proof + location)
 *   3. On approve → a Bin document is created (appears on the map) and the
 *      reporter is awarded points. On reject → nothing is created.
 */
const binRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Bin name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address/landmark is required'],
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters'],
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
        validate: {
          validator(coords) {
            return (
              Array.isArray(coords) &&
              coords.length === 2 &&
              coords[0] >= -180 && coords[0] <= 180 &&
              coords[1] >= -90 && coords[1] <= 90
            );
          },
          message: 'Coordinates must be [longitude, latitude] with valid ranges',
        },
      },
    },
    types: {
      type: [{
        type: String,
        enum: BIN_TYPES,
      }],
      required: [true, 'At least one bin type is required'],
      validate: {
        validator(types) {
          return Array.isArray(types) && types.length > 0;
        },
        message: 'At least one bin type is required',
      },
    },
    // Live camera photo proof (Cloudinary URL)
    photoUrl: {
      type: String,
      required: [true, 'A live photo of the bin is required'],
    },
    photoPublicId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

binRequestSchema.index({ location: '2dsphere' });
binRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('BinRequest', binRequestSchema);
module.exports.BIN_TYPES = BIN_TYPES;
