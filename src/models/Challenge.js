const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    tasks: [{
      action: { type: String, required: true, trim: true },
      targetCount: { type: Number, required: true, min: 1 },
      category: { type: String, trim: true },
    }],
    rewardPoints: { type: Number, default: 0, min: 0 },
    rewardVoucherPartner: { type: String, trim: true },
    weekStartDate: { type: Date, required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

challengeSchema.index({ weekStartDate: 1, isActive: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
