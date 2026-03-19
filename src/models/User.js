/**
 * models/User.js
 * The User collection — central to the entire app.
 *
 * Every other collection references User via userId.
 * This document grows over time as the user logs waste, earns points, gets badges.
 *
 * DPDP Act 2023 compliance:
 *   - Phone number stored (needed for OTP) but marked sensitive in comments
 *   - No Aadhaar, no biometrics, no financial data stored here
 *   - Password is NEVER stored in plain text — bcrypt hash only
 *   - JWT only contains { userId, role } — no PII in tokens
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Sub-schema: Badge ─────────────────────────────────────────────────────────
// Embedded inside User because badges are always read with the user profile.
// A user will have at most ~10 badges — small, bounded data = good for embedding.
const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // e.g. 'First Log', 'Eco Starter', 'Community Hero'
  },
  awardedAt: {
    type: Date,
    default: Date.now,
  },
  icon: {
    type: String, // emoji or icon key for frontend to render
    default: '🏅',
  },
}, { _id: false }); // no separate _id for embedded sub-docs

// ── Main User Schema ──────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,         // MongoDB index — no two users with same email
      lowercase: true,      // always store as lowercase to avoid case duplicates
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    phone: {
      // DPDP Act 2023: phone is sensitive — used only for OTP, not shared
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },

    password: {
      // bcrypt hash — NEVER the plain text password
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // IMPORTANT: excluded from all queries by default
                     // Must explicitly use .select('+password') to retrieve it
    },

    // ── Auth & Verification ───────────────────────────────────────────────────
    role: {
      type: String,
      enum: ['user', 'seller', 'admin'],
      default: 'user',
    },

    isVerified: {
      // true after OTP verification in Month 2
      type: Boolean,
      default: false,
    },

    otp: {
      // Temporary OTP storage — cleared after verification
      // DPDP: not stored long-term, wiped on verify or expiry
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false },
    },

    // ── Eco-Points & Gamification ─────────────────────────────────────────────
    ecoPoints: {
      // Current redeemable balance
      // Updated atomically with $inc — never read-modify-write
      type: Number,
      default: 0,
      min: [0, 'Eco-points cannot be negative'],
    },

    totalPointsEarned: {
      // Lifetime total — for leaderboard and analytics
      // Separate from ecoPoints because redemptions reduce ecoPoints but not this
      type: Number,
      default: 0,
    },

    badges: [badgeSchema], // embedded array — always loaded with profile

    // ── Waste Stats (denormalised for dashboard performance) ──────────────────
    // Why store here AND in WasteLog?
    // Reading the dashboard shouldn't require aggregating thousands of WasteLogs.
    // These counters are updated atomically ($inc) every time a waste log is created.
    totalWasteLogged: {
      type: Number,
      default: 0,   // total kg across all categories
    },

    co2Saved: {
      type: Number,
      default: 0,   // kg of CO₂ saved — calculated per waste type in Month 3
    },

    // ── Location (optional — for nearby bin suggestions) ──────────────────────
    location: {
      type: {
        type: String,
        enum: ['Point'],
        // Not required — user doesn't have to share location
      },
      coordinates: {
        type: [Number], // [longitude, latitude] — GeoJSON order
      },
    },

    // ── Profile ───────────────────────────────────────────────────────────────
    avatar: {
      type: String,   // URL to profile picture (future feature)
      default: null,
    },

    fcmToken: {
      // Firebase Cloud Messaging token for push notifications (Month 4)
      // Updated each time user logs in from a device
      type: String,
      default: null,
      select: false,  // don't expose in API responses
    },
  },
  {
    // ── Schema Options ────────────────────────────────────────────────────────
    timestamps: true, // auto-adds createdAt and updatedAt fields
    toJSON: {
      transform(doc, ret) {
        // Never expose sensitive fields in JSON output
        delete ret.password;
        delete ret.otp;
        delete ret.fcmToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// email and phone already have unique: true which creates indexes automatically.
// Add a 2dsphere index on location for geospatial queries in Month 4.
userSchema.index({ location: '2dsphere' });
// Index for leaderboard queries (sort by totalPointsEarned descending)
userSchema.index({ totalPointsEarned: -1 });

// ── Pre-save Hook: Hash password before storing ───────────────────────────────
// This runs automatically every time user.save() is called.
// 'this' refers to the document being saved.
userSchema.pre('save', async function (next) {
  // Only hash if password was actually changed (not on profile updates)
  if (!this.isModified('password')) return next();

  // bcrypt cost factor 12 = ~300ms hashing time
  // High enough to slow brute-force, low enough to not annoy users
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance Method: Compare password ────────────────────────────────────────
// Usage in login controller: const isMatch = await user.comparePassword(enteredPassword)
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ── Instance Method: Check if OTP is valid ───────────────────────────────────
userSchema.methods.isOtpValid = function (enteredOtp) {
  return (
    this.otp.code === enteredOtp &&
    this.otp.expiresAt > new Date()
  );
};

module.exports = mongoose.model('User', userSchema);
