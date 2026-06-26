const rewardEngine = require('../src/services/rewardEngine');
const User = require('../src/models/User');
const Challenge = require('../src/models/Challenge');
const ChallengeProgress = require('../src/models/ChallengeProgress');
const Voucher = require('../src/models/Voucher');

jest.mock('../src/models/User', () => ({
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../src/models/Challenge', () => ({
  findById: jest.fn(),
}));

jest.mock('../src/models/ChallengeProgress', () => ({
  findOneAndUpdate: jest.fn(),
}));

jest.mock('../src/models/Voucher', () => ({
  findOneAndUpdate: jest.fn(),
}));

describe('rewardEngine.issueReward', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns early when reward already issued', async () => {
    ChallengeProgress.findOneAndUpdate.mockResolvedValue(null);

    const result = await rewardEngine.issueReward('user1', 'challenge1', new Date());

    expect(result.alreadyIssued).toBe(true);
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('awards points and assigns voucher once', async () => {
    ChallengeProgress.findOneAndUpdate.mockResolvedValue({ _id: 'progress1' });
    Challenge.findById.mockResolvedValue({
      rewardPoints: 100,
      rewardVoucherPartner: 'GreenKart',
    });
    Voucher.findOneAndUpdate.mockResolvedValue({ code: 'GREEN1' });

    const result = await rewardEngine.issueReward('user1', 'challenge1', new Date());

    expect(result.pointsAwarded).toBe(100);
    expect(result.voucherAssigned).toEqual({ code: 'GREEN1' });
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user1', {
      $inc: { ecoPoints: 100, totalPointsEarned: 100 },
    });
    expect(Voucher.findOneAndUpdate).toHaveBeenCalledWith(
      { assignedTo: null, partnerName: 'GreenKart' },
      expect.any(Object),
      expect.objectContaining({ new: true })
    );
  });
});
