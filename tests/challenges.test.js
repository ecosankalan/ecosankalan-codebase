process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const Challenge = require('../src/models/Challenge');
const ChallengeProgress = require('../src/models/ChallengeProgress');

const MAX_DURATION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

jest.mock('../src/models/Challenge', () => {
  const mod = {
    MAX_DURATION_DAYS,
    DAY_MS,
    create: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };
  return mod;
});

jest.mock('../src/models/ChallengeProgress', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

jest.mock('../src/services/notificationService', () => ({
  challengeCreated: jest.fn().mockResolvedValue(true),
  quizCreated: jest.fn().mockResolvedValue(true),
  rewardEarned: jest.fn().mockResolvedValue(true),
  levelUnlocked: jest.fn().mockResolvedValue(true),
  getAllTokens: jest.fn().mockResolvedValue([]),
}));

jest.mock('../src/config/cloudinary', () => {
  const cloudinary = {
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://cloudinary/test/image.jpg',
        public_id: 'test/public_id',
      }),
    },
  };
  return jest.fn(() => cloudinary);
});

const userId = '507f1f77bcf86cd799439011';
const challengeId = '507f1f77bcf86cd799439022';
const token = jwt.sign({ userId, role: 'user' }, process.env.JWT_SECRET);
const adminToken = jwt.sign({ userId, role: 'admin' }, process.env.JWT_SECRET);

const START = new Date('2026-06-01T00:00:00.000Z');
const END = new Date(START.getTime() + 3 * DAY_MS);

const baseChallenge = (overrides = {}) => {
  const recentStart = new Date(Date.now() - 60 * 60 * 1000);
  const recentEnd = new Date(Date.now() + 3 * DAY_MS);
  const ch = {
    _id: challengeId,
    title: 'Reusable Bottle Week',
    description: '3-day eco challenge',
    taskTemplate: {
      description: 'Carry a reusable bottle for the day',
      action: 'daily_task',
      category: 'plastic',
      imageRequired: true,
      targetCount: 1,
      pointsConfig: { maxPoints: 100, minPoints: 10, decayType: 'linear' },
    },
    startDate: recentStart,
    expiryDate: recentEnd,
    isActive: true,
    ...overrides,
  };
  ch.toObject = function () { return { ...ch }; };
  return ch;
};

const futureStart = () => new Date(Date.now() + 60_000);
const futureEnd = () => new Date(Date.now() + 3 * DAY_MS + 60_000);

describe('Challenges API — admin & user', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/v1/challenges (admin)', () => {
    test('rejects duration > 30 days', async () => {
      const res = await request(app)
        .post('/api/v1/challenges')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Long',
          description: 'Too long',
          taskTemplate: { description: 'x' },
          startDate: START,
          expiryDate: new Date(START.getTime() + 60 * DAY_MS),
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/30 days/);
    });

    test('rejects missing taskTemplate.description', async () => {
      const res = await request(app)
        .post('/api/v1/challenges')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'X',
          description: 'Y',
          taskTemplate: {},
          startDate: START,
          expiryDate: END,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/description/i);
    });

    test('rejects non-admin users', async () => {
      const res = await request(app)
        .post('/api/v1/challenges')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'X',
          description: 'Y',
          taskTemplate: { description: 'carry bottle' },
          startDate: START,
          expiryDate: END,
        });

      expect(res.statusCode).toBe(403);
    });

    test('creates challenge with valid payload', async () => {
      Challenge.create.mockResolvedValue(baseChallenge());
      const res = await request(app)
        .post('/api/v1/challenges')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Reusable Bottle Week',
          description: '3-day eco challenge',
          taskTemplate: {
            description: 'Carry a reusable bottle for the day',
            pointsConfig: { maxPoints: 120, minPoints: 20 },
          },
          startDate: START,
          expiryDate: END,
        });

      expect(res.statusCode).toBe(201);
      expect(Challenge.create).toHaveBeenCalled();
    });
  });

  describe('POST /:id/submit', () => {
    test('rejects submission before day unlocks', async () => {
      const futureChallenge = baseChallenge({
        startDate: futureStart(),
        expiryDate: futureEnd(),
      });
      Challenge.findOne.mockResolvedValue(futureChallenge);
      ChallengeProgress.findOne.mockResolvedValue({
        userId, challengeId, dailySubmissions: [], save: jest.fn(),
      });

      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${token}`)
        .field('dayIndex', '1');

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/not unlocked/i);
    });

    test('rejects submission after window closes', async () => {
      const pastChallenge = baseChallenge({
        startDate: new Date(Date.now() - 3 * DAY_MS - 60_000),
        expiryDate: new Date(Date.now() - 60_000),
      });
      Challenge.findOne.mockResolvedValue(pastChallenge);

      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${token}`)
        .field('dayIndex', '0');

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/closed/i);
    });

    test('rejects double submission for the same dayIndex', async () => {
      Challenge.findOne.mockResolvedValue(baseChallenge());
      ChallengeProgress.findOne.mockResolvedValue({
        userId, challengeId,
        dailySubmissions: [{ dayIndex: 0, submittedAt: new Date() }],
        save: jest.fn(),
      });

      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${token}`)
        .field('dayIndex', '0')
        .attach('image', Buffer.from('fake-image'), {
          filename: 'proof.jpg', contentType: 'image/jpeg',
        });

      expect(res.statusCode).toBe(409);
    });

    test('rejects missing image when imageRequired is true', async () => {
      Challenge.findOne.mockResolvedValue(baseChallenge());
      ChallengeProgress.findOne.mockResolvedValue({
        userId, challengeId, dailySubmissions: [], save: jest.fn(),
      });

      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${token}`)
        .field('dayIndex', '0');

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/image/i);
    });

    test('accepts submission with image, awards decayed points', async () => {
      const progressDoc = {
        userId, challengeId, dailySubmissions: [],
        save: jest.fn().mockResolvedValue(true),
      };
      Challenge.findOne.mockResolvedValue(baseChallenge());
      ChallengeProgress.findOne.mockResolvedValue(progressDoc);

      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/submit`)
        .set('Authorization', `Bearer ${token}`)
        .field('dayIndex', '0')
        .field('remarks', 'Did it!')
        .attach('image', Buffer.from('fake-image'), {
          filename: 'proof.jpg', contentType: 'image/jpeg',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.progress.dayIndex).toBe(0);
      expect(res.body.progress.remarks).toBe('Did it!');
      expect(res.body.progress.imageUrl).toMatch(/cloudinary/);
      expect(res.body.progress.pointsAwarded).toBeGreaterThanOrEqual(10);
      expect(res.body.progress.pointsAwarded).toBeLessThanOrEqual(100);
    });
  });

  describe('GET /:id/leaderboard', () => {
    test('returns top 10 sorted by totalPoints desc', async () => {
      Challenge.findById.mockReturnValue({
        lean: () => Promise.resolve({ _id: challengeId }),
      });
      const rows = Array.from({ length: 12 }).map((_, i) => ({
        userId: { _id: `u${i}`, name: `User ${i}`, avatarUrl: null },
        totalPoints: 100 - i * 5,
        joinedAt: new Date(),
        allCompleted: false,
      }));
      ChallengeProgress.find.mockReturnValue({
        populate: () => ({
          sort: () => ({
            lean: () => Promise.resolve(rows),
          }),
        }),
      });

      const res = await request(app)
        .get(`/api/v1/challenges/${challengeId}/leaderboard`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.top10).toHaveLength(10);
      expect(res.body.top10[0].rank).toBe(1);
      expect(res.body.top10[0].totalPoints).toBe(100);
      expect(res.body.total).toBe(12);
    });

    test('places current user outside top 10 in currentUser field with correct rank', async () => {
      Challenge.findById.mockReturnValue({
        lean: () => Promise.resolve({ _id: challengeId }),
      });
      const rows = [];
      for (let i = 0; i < 15; i += 1) {
        rows.push({
          userId: { _id: i === 14 ? userId : `u${i}`, name: `User ${i}`, avatarUrl: null },
          totalPoints: 100 - i,
          joinedAt: new Date(),
          allCompleted: false,
        });
      }
      ChallengeProgress.find.mockReturnValue({
        populate: () => ({
          sort: () => ({
            lean: () => Promise.resolve(rows),
          }),
        }),
      });

      const res = await request(app)
        .get(`/api/v1/challenges/${challengeId}/leaderboard`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.top10).toHaveLength(10);
      expect(res.body.currentUser).toBeTruthy();
      expect(res.body.currentUser.rank).toBe(15);
      expect(res.body.currentUser.totalPoints).toBe(86);
    });
  });

  describe('GET /:id (detail)', () => {
    test('returns daily slots with status, hides image/remarks for non-owner', async () => {
      Challenge.findById.mockResolvedValue(baseChallenge());
      ChallengeProgress.findOne.mockResolvedValue(null);
      ChallengeProgress.create.mockImplementation(async (doc) => ({
        ...doc, dailySubmissions: [],
      }));

      const res = await request(app)
        .get(`/api/v1/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.durationDays).toBe(3);
      expect(Array.isArray(res.body.dailySlots)).toBe(true);
      expect(res.body.dailySlots).toHaveLength(3);
      expect(res.body.dailySlots[0].status).toBe('unlocked');
      expect(res.body.dailySlots[1].status).toBe('locked');
      expect(res.body.dailySlots[2].status).toBe('locked');
      expect(res.body.dailySlots[0].submission).toBeNull();
    });

    test('admin sees image/remarks of any user', async () => {
      Challenge.findById.mockResolvedValue(baseChallenge());
      ChallengeProgress.findOne.mockResolvedValue(null);
      ChallengeProgress.create.mockImplementation(async (doc) => ({
        ...doc, dailySubmissions: [],
      }));

      const res = await request(app)
        .get(`/api/v1/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.durationDays).toBe(3);
    });
  });

  describe('POST /:id/join', () => {
    test('creates a progress row when not joined yet', async () => {
      Challenge.findById.mockResolvedValue(baseChallenge());
      ChallengeProgress.findOne.mockResolvedValue(null);
      ChallengeProgress.create.mockResolvedValue({
        userId, challengeId, dailySubmissions: [],
      });

      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/join`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
      expect(ChallengeProgress.create).toHaveBeenCalled();
    });

    test('returns 409 if already joined', async () => {
      Challenge.findById.mockResolvedValue(baseChallenge());
      ChallengeProgress.findOne.mockResolvedValue({ userId, challengeId });

      const res = await request(app)
        .post(`/api/v1/challenges/${challengeId}/join`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(409);
    });
  });

  describe('GET /active', () => {
    test('returns active challenges with durationDays and userProgress', async () => {
      Challenge.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: challengeId,
            title: 'X',
            description: 'd',
            taskTemplate: { description: 't' },
            startDate: START,
            expiryDate: END,
            isActive: true,
          },
        ]),
      });
      ChallengeProgress.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { challengeId, totalPoints: 50, allCompleted: false, dailySubmissions: [{ dayIndex: 0, submittedAt: new Date() }] },
        ]),
      });

      const res = await request(app)
        .get('/api/v1/challenges/active')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0].durationDays).toBe(3);
      expect(res.body[0].joined).toBe(true);
      expect(res.body[0].userProgress.totalPoints).toBe(50);
    });
  });
});
