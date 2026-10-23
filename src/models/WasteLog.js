/**
 * models/WasteLog.js
 * Every waste entry a user makes — manual or AI-scanned.
 *
 * This is the most written-to collection in the app.
 * Every log entry:
 *   1. Creates a WasteLog document
 *   2. $inc ecoPoints on User (atomic — no race conditions)
 *   3. $inc totalWasteLogged on User
 *
 * Eco-points per kg (from proposal):
 *   e-waste  = 10 pts/kg
 *   metal    = 6  pts/kg
 *   plastic  = 5  pts/kg
 *   paper    = 4  pts/kg
 *   organic  = 3  pts/kg
 *   other    = 2  pts/kg
 */

const mongoose = require('mongoose');

// ── AI Scan Result sub-schema ─────────────────────────────────────────────────
// Embedded because it's always read with the log entry, and it's small.
const aiScanSchema = new mongoose.Schema({
  rawResponse: {
    type: String,    // OpenAI's full text response (for debugging)
  },
  confidence: {
    type: Number,    // 0-1 confidence score from OpenAI
    min: 0,
    max: 1,
  },
  detectedCategory: {
    type: String,    // what OpenAI thinks it is — may differ from user's final choice
  },
}, { _id: false });

// ── Main WasteLog Schema ──────────────────────────────────────────────────────
const wasteLogSchema = new mongoose.Schema(
  {
    // ── Who logged it ─────────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',          // tells Mongoose which model to populate from
      required: [true, 'User ID is required'],
      index: true,          // we query WasteLogs by userId very frequently
    },

    // ── What was logged ───────────────────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Waste category is required'],
      enum: {
        values: ['plastic', 'paper', 'metal', 'organic', 'e-waste', 'other'],
        message: '{VALUE} is not a valid waste category',
      },
    },

    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be at least 0.01 kg'],
      max: [1000, 'Quantity seems too high — please verify'],
    },

    unit: {
      type: String,
      enum: ['kg', 'g'],
      default: 'kg',
      // Frontend always converts grams to kg before sending to API
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },

    imageUrl: {
      type: String,   // URL of uploaded waste photo (used by OpenAI in Month 3)
      default: null,
    },

    // ── How it was logged ─────────────────────────────────────────────────────
    logMethod: {
      type: String,
      enum: ['manual', 'ai_scan'],
      default: 'manual',
    },

    // ── Health & safety (physician review) ────────────────────────────────────
    isHazardous: { type: Boolean, default: false },
    hazardType: {
      type: String,
      enum: [null, 'sanitary', 'biomedical', 'e-waste-unsafe', 'chemical', 'sharp', 'other-hazard'],
      default: null,
    },
    safetyAck: { type: Boolean, default: false },

    aiScan: aiScanSchema, // null for manual logs, populated for AI scans

    // ── Calculated fields (computed at log time, stored for fast reads) ────────
    pointsEarned: {
      type: Number,
      required: true,
      // Calculated as: quantity(kg) × pointsPerKg[category]
      // Stored so the history screen shows exact points per entry
    },

    // ── Where ────────────────────────────────────────────────────────────────
    // Optional — user's location at time of logging (for heatmap in future)
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number], // [longitude, latitude]
    },
  },
  {
    timestamps: true, // createdAt = when waste was logged
    toJSON: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Most common queries:
//   1. GET /waste/history → filter by userId + sort by createdAt
//   2. GET /waste/stats → aggregate by userId + category
wasteLogSchema.index({ userId: 1, createdAt: -1 }); // compound index for history
wasteLogSchema.index({ userId: 1, category: 1 });   // compound index for stats
wasteLogSchema.index({ location: '2dsphere' });      // for heatmap (future)

// ── Virtual: quantity in kg (normalised) ─────────────────────────────────────
// If user enters grams, convert for display
wasteLogSchema.virtual('quantityInKg').get(function () {
  return this.unit === 'g' ? this.quantity / 1000 : this.quantity;
});



module.exports = mongoose.model('WasteLog', wasteLogSchema);
