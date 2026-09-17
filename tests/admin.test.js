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
const User = require('../src/models/User');
const WasteLog = require('../src/models/WasteLog');
const Event = require('../src/models/Event');
const Challenge = require('../src/models/Challenge');
const ChallengeProgress = require('../src/models/ChallengeProgress');
const Voucher = require('../src/models/Voucher');

jest.mock('../src/models/User', () => ({
  countDocuments: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../src/models/WasteLog', () => ({
  aggregate: jest.fn(),
}));

jest.mock('../src/models/Event', () => ({
  countDocuments: jest.fn(),
}));

jest.mock('../src/models/Challenge', () => ({
  countDocuments: jest.fn(),
}));

jest.mock('../src/models/ChallengeProgress', () => ({
  countDocuments: jest.fn(),
}));

jest.mock('../src/models/Voucher', () => ({
  insertMany: jest.fn(),
  aggregate: jest.fn(),
}));

describe('Admin API', () => {
  const adminToken = 'test-admin-token';

  beforeEach(() => {
    jest.clearAllMocks();
    // findOne is called by protect's findOrCreateMongoUser — match on appwriteUserId OR email
    User.findOne.mockResolvedValue({ _id: '507f1f77bcf86cd799439011', role: 'admin', email: 'admin@example.com' });
  });

  test('POST /admin/vouchers bulk inserts and reports duplicates', async () => {
    Voucher.insertMany.mockRejectedValue({
      insertedDocs: [{ code: 'A' }],
      writeErrors: [{ code: 11000 }],
    });

    const res = await request(app)
      .post('/api/v1/admin/vouchers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send([
        { code: 'A', partnerName: 'GreenKart' },
        { code: 'A', partnerName: 'GreenKart' },
      ]);

    expect(res.statusCode).toBe(201);
    expect(res.body.insertedCount).toBe(1);
    expect(res.body.duplicateCount).toBe(1);
  });

  test('GET /admin/vouchers/stats returns partner counts', async () => {
    Voucher.aggregate.mockResolvedValue([{ partnerName: 'GreenKart', totalIssued: 2, totalAssigned: 1, remaining: 1 }]);

    const res = await request(app)
      .get('/api/v1/admin/vouchers/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body[0].remaining).toBe(1);
  });

  test('GET /admin/stats returns platform aggregation', async () => {
    User.countDocuments.mockResolvedValue(10);
    WasteLog.aggregate.mockResolvedValue([{ totalWasteKg: 12.345 }]);
    Event.countDocuments.mockResolvedValue(2);
    Challenge.countDocuments.mockResolvedValue(3);
    ChallengeProgress.countDocuments.mockResolvedValue(0);
    Voucher.aggregate.mockResolvedValue([{ partnerName: 'GreenKart', issued: 1 }]);

    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.totalUsers).toBe(10);
    expect(res.body.totalWasteKg).toBe(12.35);
    expect(res.body.openAICostMTD).toBe(0);
  });
});
