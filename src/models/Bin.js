/**
 * models/Bin.js
 * Recycling bin locations — the map layer of EcoSankalan.
 *
 * The KEY feature here is the 2dsphere geospatial index.
 * This lets MongoDB answer queries like:
 *   "Find all bins within 2km of lat 28.6139, lng 77.2090"
 * using a $near query — without scanning every document.
 *
 * GeoJSON format (MongoDB standard):
 *   { type: 'Point', coordinates: [longitude, latitude] }
 *   ⚠️ Note: longitude FIRST, latitude SECOND — opposite of Google Maps
 *
 * Month 4 API:
 *   GET /bins?lat=28.6139&lng=77.2090&radius=2000
 *   → uses $near with $maxDistance (in metres)
 */

const mongoose = require('mongoose');

const binSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Bin name/label is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
      // e.g. "NSUT Gate 1 Recycling Point", "Sector 10 Community Bin"
    },

    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },

    // ── Location (GeoJSON Point) ──────────────────────────────────────────────
    // This is what enables the $near geospatial query
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],   // [longitude, latitude] — GeoJSON order!
        required: true,
        validate: {
          validator: function (coords) {
            return (
              coords.length === 2 &&
              coords[0] >= -180 && coords[0] <= 180 && // longitude
              coords[1] >= -90  && coords[1] <= 90     // latitude
            );
          },
          message: 'Coordinates must be [longitude, latitude] with valid ranges',
        },
      },
    },

    // ── Address (human-readable, for display on map popup) ───────────────────
    address: {
      street:   { type: String, trim: true },
      landmark: { type: String, trim: true }, // e.g. "Near NSUT main gate"
      area:     { type: String, trim: true }, // e.g. "Dwarka Sector 3"
      city:     { type: String, trim: true, default: 'New Delhi' },
      pincode:  { type: String, trim: true },
    },

    // ── What waste types this bin accepts ────────────────────────────────────
    accepts: {
      type: [String],
      enum: ['plastic', 'paper', 'metal', 'organic', 'e-waste', 'other'],
      default: ['plastic', 'paper', 'other'],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Bin must accept at least one waste type',
      },
    },

    // ── Operational status ────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
      index: true,  // we always filter by isActive: true in queries
    },

    // ── Who added this bin ────────────────────────────────────────────────────
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // admin or verified user who reported this bin
    },

    // ── Operating hours (optional) ────────────────────────────────────────────
    operatingHours: {
      type: String,
      // e.g. "Mon-Sat 8AM-6PM" — free text for now, structured later
      default: '24/7',
    },

    // ── Photo of the bin ─────────────────────────────────────────────────────
    imageUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// THE most important index in this schema:
// 2dsphere enables MongoDB's geospatial query operators ($near, $geoWithin)
// Without this index, $near queries will throw an error
binSchema.index({ location: '2dsphere' });

// Filter active bins efficiently
binSchema.index({ isActive: 1 });

module.exports = mongoose.model('Bin', binSchema);
