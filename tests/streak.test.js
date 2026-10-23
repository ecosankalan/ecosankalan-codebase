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
  create: jest.fn(),
  countDocuments: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

// Calendar day in IST — must match the endpoint's timezone formatting.
const istDay = (offsetDays = 0) =>
  new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata',
  });

const days = (...offsets) => offsets.map((offset) => ({ _id: istDay(offset) }));

describe('GET /api/v1/waste/streak', () => {
  const userId = '507f1f77bcf86cd799439011';
  const token = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    User.findOne.mockResolvedValue({ _id: userId, role: 'user', email: 'test@example.com' });
  });

  test('counts consecutive days ending today', async () => {
    WasteLog.aggregate.mockResolvedValue(days(0, -1, -2));

    const res = await request(app)
      .get('/api/v1/waste/streak')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.currentStreak).toBe(3);
    expect(res.body.longestStreak).toBe(3);
    expect(res.body.loggedToday).toBe(true);
  });

  test('streak stays alive from yesterday when today is not logged yet', async () => {
    WasteLog.aggregate.mockResolvedValue(days(-1, -2, -3));

    const res = await request(app)
      .get('/api/v1/waste/streak')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.currentStreak).toBe(3);
    expect(res.body.loggedToday).toBe(false);
  });

  test('current streak is 0 after a two-day gap', async () => {
    WasteLog.aggregate.mockResolvedValue(days(-3, -4));

    const res = await request(app)
      .get('/api/v1/waste/streak')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.currentStreak).toBe(0);
    expect(res.body.longestStreak).toBe(2);
    expect(res.body.loggedToday).toBe(false);
  });

  test('returns zeroed streak for an account with no logs', async () => {
    WasteLog.aggregate.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/v1/waste/streak')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      currentStreak: 0,
      longestStreak: 0,
      loggedToday: false,
    });
  });

  test('requires authentication', async () => {
    const res = await request(app).get('/api/v1/waste/streak');
    expect(res.statusCode).toBe(401);
  });
});
