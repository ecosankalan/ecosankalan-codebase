process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';
process.env.APPWRITE_ENDPOINT = 'https://test.cloud.appwrite.io/v1';
process.env.APPWRITE_PROJECT_ID = 'test-project';
process.env.APPWRITE_API_KEY = 'test-api-key';

const request = require('supertest');

// Token-aware mock — different Appwrite identities for admin vs user tokens
jest.mock('node-appwrite', () => {
  let sessionToken = null;

  const adminAccount = {
    get: jest.fn().mockResolvedValue({
      $id: 'appwrite-admin-123',
      email: 'admin@example.com',
      name: 'Admin User',
    }),
  };

  const userAccount = {
    get: jest.fn().mockResolvedValue({
      $id: 'appwrite-user-123',
      email: 'test@example.com',
      name: 'Test User',
    }),
  };

  const mockClient = {
    setEndpoint: jest.fn().mockReturnThis(),
    setProject: jest.fn().mockReturnThis(),
    setKey: jest.fn().mockReturnThis(),
    setJWT: jest.fn().mockImplementation((token) => {
      sessionToken = token;
      return mockClient;
    }),
    config: {
      endpoint: 'https://test.cloud.appwrite.io/v1',
      project: 'test-project',
    },
    account: jest.fn(() => sessionToken === 'test-admin-token' ? adminAccount : userAccount),
  };

  return {
    Client: jest.fn(() => mockClient),
    Account: mockClient.account,
  };
});

const app = require('../src/app');
const WasteLog = require('../src/models/WasteLog');
const User = require('../src/models/User');

jest.mock('../src/models/WasteLog', () => ({
  aggregate: jest.fn(),
  find: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

describe('GET /api/v1/waste/stats', () => {
  const userId = '507f1f77bcf86cd799439011';
  const token = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    // findOne is called by protect's findOrCreateMongoUser
    User.findOne.mockResolvedValue({ _id: userId, role: 'user', email: 'test@example.com' });
    WasteLog.aggregate
      .mockResolvedValueOnce([{ totalKg: 12.345, totalCo2Saved: 8.333, totalPointsEarned: 340 }])
      .mockResolvedValueOnce([
        { _id: 'plastic', kg: 3.234 },
        { _id: 'e-waste', kg: 0.5 },
      ])
      .mockResolvedValueOnce([{ _id: { date: '2026-05-28', category: 'plastic' }, kg: 1.235 }]);
    WasteLog.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
    });
  });

  test('returns rounded aggregation for week range', async () => {
    const res = await request(app)
      .get('/api/v1/waste/stats?range=week')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.totalKg).toBe(12.35);
    expect(res.body.totalCo2Saved).toBe(8.33);
    expect(res.body.categoryBreakdown.plastic).toBe(3.23);
    expect(res.body.categoryBreakdown.eWaste).toBe(0.5);
    expect(res.body.weeklyTrend).toEqual([
      { date: '2026-05-28', kg: 1.24, plastic: 1.24, organic: 0, eWaste: 0, metal: 0, paper: 0, other: 0 },
    ]);
  });

  test.each(['month', 'all'])('accepts %s range', async (range) => {
    const res = await request(app)
      .get(`/api/v1/waste/stats?range=${range}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(WasteLog.aggregate).toHaveBeenCalledTimes(3);
  });
});
