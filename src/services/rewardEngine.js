const User = require('../models/User');
const Challenge = require('../models/Challenge');
const ChallengeProgress = require('../models/ChallengeProgress');
const Voucher = require('../models/Voucher');

async function issueReward(userId, challengeId, weekStartDate) {
  const progress = await ChallengeProgress.findOneAndUpdate(
    { userId, challengeId, weekStartDate, allCompleted: true, rewardIssued: false },
    { $set: { rewardIssued: true } },
    { new: true }
  );

  if (!progress) {
    return { pointsAwarded: 0, voucherAssigned: null, alreadyIssued: true };
  }

  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    return { pointsAwarded: 0, voucherAssigned: null };
  }

  const pointsAwarded = challenge.rewardPoints || 0;
  if (pointsAwarded > 0) {
    await User.findByIdAndUpdate(userId, {
      $inc: { ecoPoints: pointsAwarded, totalPointsEarned: pointsAwarded },
    });
  }

  let voucherAssigned = null;
  if (challenge.rewardVoucherPartner) {
    voucherAssigned = await Voucher.findOneAndUpdate(
      { assignedTo: null, partnerName: challenge.rewardVoucherPartner },
      { $set: { assignedTo: userId, assignedAt: new Date() } },
      { new: true, sort: { expiresAt: 1 } }
    );
  }

  return { pointsAwarded, voucherAssigned };
}

module.exports = { issueReward };
