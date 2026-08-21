const mongoose = require('mongoose');

const MAX_DURATION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const pointsConfigSchema = new mongoose.Schema(
  {
    maxPoints: { type: Number, default: 100, min: 0 },
    minPoints: { type: Number, default: 10, min: 0 },
    decayType: {
      type: String,
      enum: ['linear'],
      default: 'linear',
    },
  },
  { _id: false }
);

pointsConfigSchema.pre('validate', function ensureFloor(next) {
  if (this.minPoints > this.maxPoints) {
    this.invalidate('minPoints', 'minPoints must be ≤ maxPoints');
  }
  next();
});

const taskTemplateSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
      minlength: [1, 'Task description cannot be empty'],
      maxlength: [500, 'Task description cannot exceed 500 characters'],
    },
    action: { type: String, trim: true, default: 'daily_task' },
    category: { type: String, trim: true, default: null },
    imageRequired: { type: Boolean, default: true },
    targetCount: { type: Number, default: 1, min: 1 },
    pointsConfig: { type: pointsConfigSchema, default: () => ({}) },
  },
  { _id: false }
);

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    taskTemplate: { type: taskTemplateSchema, required: true },
    startDate: { type: Date, required: true, index: true },
    expiryDate: { type: Date, required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

challengeSchema.virtual('durationDays').get(function () {
  if (!this.startDate || !this.expiryDate) return 0;
  return Math.max(1, Math.ceil((this.expiryDate - this.startDate) / DAY_MS));
});

challengeSchema.set('toJSON', { virtuals: true });
challengeSchema.set('toObject', { virtuals: true });

challengeSchema.pre('validate', function ensureWindow(next) {
  if (this.startDate && this.expiryDate) {
    if (this.expiryDate <= this.startDate) {
      return this.invalidate('expiryDate', 'expiryDate must be after startDate');
    }
    const days = Math.ceil((this.expiryDate - this.startDate) / DAY_MS);
    if (days < 1) {
      return this.invalidate('expiryDate', 'Challenge must be at least 1 day long');
    }
    if (days > MAX_DURATION_DAYS) {
      return this.invalidate(
        'expiryDate',
        `Challenge cannot exceed ${MAX_DURATION_DAYS} days`
      );
    }
  }
  next();
});

challengeSchema.statics.MAX_DURATION_DAYS = MAX_DURATION_DAYS;
challengeSchema.statics.DAY_MS = DAY_MS;

module.exports = mongoose.model('Challenge', challengeSchema);
