const mongoose = require('mongoose');

const challengeProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    weekStartDate: { type: Date, required: true, index: true },
    taskProgress: [{
      taskIndex: { type: Number, required: true },
      currentCount: { type: Number, default: 0, min: 0 },
      completed: { type: Boolean, default: false },
    }],
    allCompleted: { type: Boolean, default: false },
    rewardIssued: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

challengeProgressSchema.index(
  { userId: 1, challengeId: 1, weekStartDate: 1 },
  { unique: true }
);

module.exports = mongoose.model('ChallengeProgress', challengeProgressSchema);
