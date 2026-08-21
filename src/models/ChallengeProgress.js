const mongoose = require('mongoose');

const dailySubmissionSchema = new mongoose.Schema(
  {
    dayIndex: { type: Number, required: true, min: 0 },
    submittedAt: { type: Date, default: null },
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null },
    remarks: { type: String, default: null, maxlength: 500 },
    pointsAwarded: { type: Number, default: null, min: 0 },
  },
  { _id: false }
);

const challengeProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
      index: true,
    },
    joinedAt: { type: Date, default: () => new Date() },
    dailySubmissions: {
      type: [dailySubmissionSchema],
      default: [],
    },
    totalPoints: { type: Number, default: 0, min: 0 },
    allCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

challengeProgressSchema.index(
  { userId: 1, challengeId: 1 },
  { unique: true }
);

challengeProgressSchema.index({ challengeId: 1, totalPoints: -1, joinedAt: 1 });

module.exports = mongoose.model('ChallengeProgress', challengeProgressSchema);
