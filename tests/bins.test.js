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
const Bin = require('../src/models/Bin');
const User = require('../src/models/User');

jest.mock('../src/models/Bin', () => ({
  find: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

describe('Bins API', () => {
  const userId = '507f1f77bcf86cd799439011';
  const userToken = 'test-user-token';
  const adminToken = 'test-admin-token';

  beforeEach(() => {
    jest.clearAllMocks();
    // findOne is called by protect's findOrCreateMongoUser — match on appwriteUserId OR email
    User.findOne.mockImplementation((query) => {
      if (query.email === 'admin@example.com' || query.appwriteUserId === 'appwrite-admin-123') {
        return Promise.resolve({ _id: userId, role: 'admin', email: 'admin@example.com' });
      }
      return Promise.resolve({ _id: userId, role: 'user', email: 'test@example.com' });
    });
  });

  test('POST /bins rejects non-admin', async () => {
    const res = await request(app)
      .post('/api/v1/bins')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});

    expect(res.statusCode).toBe(403);
  });

  test('POST /bins creates for admin', async () => {
    const created = { _id: 'bin1', name: 'Gate Bin' };
    Bin.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/v1/bins')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Gate Bin',
        address: 'NSUT Gate 1',
        location: { coordinates: [77.03, 28.61] },
        types: ['plastic'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(created);
  });

  test('GET /bins returns nearest-first with distanceMetres', async () => {
    const lean = jest.fn().mockResolvedValue([
      { _id: 'near', location: { coordinates: [77.0301, 28.6101] } },
      { _id: 'far', location: { coordinates: [77.04, 28.62] } },
    ]);
    Bin.find.mockReturnValue({ lean });

    const res = await request(app).get('/api/v1/bins?lat=28.61&lng=77.03&radius=10000');

    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('distanceMetres');
    expect(Bin.find).toHaveBeenCalledWith(expect.objectContaining({
      location: expect.objectContaining({ $near: expect.any(Object) }),
    }));
  });
});
