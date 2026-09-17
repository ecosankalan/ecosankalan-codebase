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
const Voucher = require('../src/models/Voucher');

jest.mock('../src/models/User', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock('../src/models/Voucher', () => ({
  aggregate: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

describe('Vouchers API', () => {
  const userId = '507f1f77bcf86cd799439011';
  const token = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    // findOne is called by protect's findOrCreateMongoUser
    User.findOne.mockResolvedValue({ _id: userId, role: 'user', email: 'test@example.com' });
  });

  const mockUserQuery = (user) => ({
    select: jest.fn().mockResolvedValue(user),
  });

  test('unlock succeeds and deducts points after voucher assignment', async () => {
    User.findById.mockReturnValue(mockUserQuery({ _id: userId, ecoPoints: 500 }));
    const mockVoucher = { _id: 'voucher1', partnerName: 'GreenKart' };
    mockVoucher.toObject = function () { return { ...this }; };
    Voucher.findOneAndUpdate.mockResolvedValue(mockVoucher);
    User.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app)
      .post('/api/v1/vouchers/unlock')
      .set('Authorization', `Bearer ${token}`)
      .send({ partnerName: 'GreenKart' });

    expect(res.statusCode).toBe(200);
    expect(Voucher.findOneAndUpdate).toHaveBeenCalledWith(
      { assignedTo: null, partnerName: 'GreenKart' },
      expect.any(Object),
      expect.objectContaining({ new: true })
    );
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, { $inc: { ecoPoints: -500 } });
  });

  test('GET my returns assigned vouchers active first', async () => {
    Voucher.aggregate.mockResolvedValue([{ code: 'GREEN1', isExpired: false }]);

    const res = await request(app)
      .get('/api/v1/vouchers/my')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ code: 'GREEN1', isExpired: false }]);
    expect(Voucher.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ $match: expect.any(Object) }),
      expect.objectContaining({ $sort: { isExpired: 1, expiresAt: 1 } }),
    ]));
  });

  test('unlock with insufficient points returns 400 and does not assign voucher', async () => {
    User.findById.mockReturnValue(mockUserQuery({ _id: userId, ecoPoints: 100 }));

    const res = await request(app)
      .post('/api/v1/vouchers/unlock')
      .set('Authorization', `Bearer ${token}`)
      .send({ partnerName: 'GreenKart' });

    expect(res.statusCode).toBe(400);
    expect(Voucher.findOneAndUpdate).not.toHaveBeenCalled();
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('unlock with empty pool returns 409 and does not deduct points', async () => {
    User.findById.mockReturnValue(mockUserQuery({ _id: userId, ecoPoints: 500 }));
    Voucher.findOneAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/vouchers/unlock')
      .set('Authorization', `Bearer ${token}`)
      .send({ partnerName: 'GreenKart' });

    expect(res.statusCode).toBe(409);
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});
