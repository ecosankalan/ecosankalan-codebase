/**
 * models/User.js
 * User schema aligned to Month 2 Auth/Profile + FR-10 badge storage.
 *
 * Key fields required by current controllers/tasks:
 * - `passwordHash` (bcrypt hash, saltRounds:12)
 * - `badgesEarned` (string IDs; use $addToSet to avoid duplicates)
 * - profile updates allowed: `name`, `area`, `avatarUrl`
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      // minlength: [2, 'Name must be at least 2 characters'],
      // maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      // match: [/^\\S+@\\S+\\.\\S+$/, 'Please enter a valid email address'],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      // match: [/^[6-9]\\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },

    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },

    role: {
      type: String,
      enum: ['user', 'seller', 'admin'],
      default: 'user',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      // Stored as bcrypt hash of the 6-digit OTP for verification.
      code: { type: String, select: false, default: null },
      expiresAt: { type: Date, select: false, default: null },
    },

    // Profile (FR-04 updatable subset)
    area: { type: String, default: null, trim: true, maxlength: 120 },
    avatarUrl: { type: String, default: null },

    // Points / stats (used across months)
    ecoPoints: { type: Number, default: 0, min: 0 },
    totalCo2Saved: { type: Number, default: 0, min: 0 },
    totalWasteLogged: { type: Number, default: 0, min: 0 },
    totalPointsEarned: { type: Number, default: 0, min: 0 },

    // FR-10 badges
    badgesEarned: {
      type: [String],
      default: [],
    },

    // Optional location (future)
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },

    fcmToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash;
        delete ret.otp;
        delete ret.fcmToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ location: '2dsphere' });
userSchema.index({ totalPointsEarned: -1 });

userSchema.methods.comparePassword = async function comparePassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.methods.isOtpValid = async function isOtpValid(enteredOtp) {
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) return false;
  if (this.otp.expiresAt <= new Date()) return false;
  return bcrypt.compare(String(enteredOtp), this.otp.code);
};

module.exports = mongoose.model('User', userSchema);

