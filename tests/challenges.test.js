process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const Challenge = require('../src/models/Challenge');
const ChallengeProgress = require('../src/models/ChallengeProgress');
const rewardEngine = require('../src/services/rewardEngine');

jest.mock('../src/models/Challenge', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock('../src/models/ChallengeProgress', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../src/services/rewardEngine', () => ({
  issueReward: jest.fn(),
}));

describe('Challenges API', () => {
  const userId = '507f1f77bcf86cd799439011';
  const token = jwt.sign({ userId, role: 'user' }, process.env.JWT_SECRET);

  beforeEach(() => jest.clearAllMocks());

  test('GET active includes per-user progress and deadline', async () => {
    Challenge.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          _id: 'challenge1',
          title: 'Log Plastic',
          tasks: [{ action: 'waste_log', targetCount: 2, category: 'plastic' }],
        },
      ]),
    });
    ChallengeProgress.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          challengeId: 'challenge1',
          taskProgress: [{ taskIndex: 0, currentCount: 1, completed: false }],
        },
      ]),
    });

    const res = await request(app)
      .get('/api/v1/challenges/active')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body[0].progress.taskProgress[0].currentCount).toBe(1);
    expect(res.body[0]).toHaveProperty('deadline');
  });

  test('POST progress triggers idempotent reward only once', async () => {
    const progress = {
      _id: 'progress1',
      taskProgress: [{ taskIndex: 0, currentCount: 0, completed: false }],
      allCompleted: false,
      rewardIssued: false,
      save: jest.fn().mockResolvedValue(true),
    };

    Challenge.findOne.mockResolvedValue({
      _id: 'challenge1',
      tasks: [{ action: 'waste_log', targetCount: 1, category: 'plastic' }],
    });
    ChallengeProgress.findOne.mockResolvedValue(progress);
    ChallengeProgress.findById.mockResolvedValue({ ...progress, allCompleted: true, rewardIssued: true });
    rewardEngine.issueReward.mockResolvedValue({ pointsAwarded: 100, voucherAssigned: null });

    const res = await request(app)
      .post('/api/v1/challenges/challenge1/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'waste_log', category: 'plastic', count: 1 });

    expect(res.statusCode).toBe(200);
    expect(rewardEngine.issueReward).toHaveBeenCalledTimes(1);
  });

  test('POST progress creates progress row when missing', async () => {
    const progress = {
      _id: 'progress2',
      taskProgress: [{ taskIndex: 0, currentCount: 0, completed: false }],
      allCompleted: false,
      rewardIssued: false,
      save: jest.fn().mockResolvedValue(true),
    };

    Challenge.findOne.mockResolvedValue({
      _id: 'challenge1',
      tasks: [{ action: 'waste_log', targetCount: 2, category: 'plastic' }],
    });
    ChallengeProgress.findOne.mockResolvedValue(null);
    ChallengeProgress.create.mockResolvedValue(progress);

    const res = await request(app)
      .post('/api/v1/challenges/challenge1/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'waste_log', category: 'plastic', count: 1 });

    expect(res.statusCode).toBe(200);
    expect(ChallengeProgress.create).toHaveBeenCalled();
    expect(progress.save).toHaveBeenCalled();
  });

  test('POST progress does not reissue completed reward', async () => {
    const progress = {
      _id: 'progress1',
      taskProgress: [{ taskIndex: 0, currentCount: 1, completed: true }],
      allCompleted: true,
      rewardIssued: true,
      save: jest.fn().mockResolvedValue(true),
    };

    Challenge.findOne.mockResolvedValue({
      _id: 'challenge1',
      tasks: [{ action: 'waste_log', targetCount: 1, category: 'plastic' }],
    });
    ChallengeProgress.findOne.mockResolvedValue(progress);

    const res = await request(app)
      .post('/api/v1/challenges/challenge1/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'waste_log', category: 'plastic', count: 1 });

    expect(res.statusCode).toBe(200);
    expect(rewardEngine.issueReward).not.toHaveBeenCalled();
  });

  test('GET history returns grouped eight-week progress', async () => {
    const lean = jest.fn().mockResolvedValue([
      {
        weekStartDate: new Date('2026-06-01T00:00:00.000Z'),
        challengeId: { title: 'Plastic Week' },
        allCompleted: true,
        rewardIssued: true,
        taskProgress: [{ taskIndex: 0, currentCount: 2, completed: true }],
      },
    ]);
    const sort = jest.fn().mockReturnValue({ lean });
    const populate = jest.fn().mockReturnValue({ sort });
    ChallengeProgress.find.mockReturnValue({ populate });

    const res = await request(app)
      .get('/api/v1/challenges/history')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body[0].challenges[0].status).toBe('completed');
    expect(res.body[0].challenges[0].rewardReceived).toBe(true);
  });
});
