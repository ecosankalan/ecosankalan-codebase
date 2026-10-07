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

// Mock Cloudinary — no real uploads in tests
jest.mock('../src/config/cloudinary', () => jest.fn(() => ({
  uploader: {
    upload: jest.fn().mockResolvedValue({
      secure_url: 'https://cloudinary.test/bin.jpg',
      public_id: 'bin_123',
    }),
  },
})));

const app = require('../src/app');
const BinRequest = require('../src/models/BinRequest');
const Bin = require('../src/models/Bin');
const User = require('../src/models/User');

jest.mock('../src/models/BinRequest', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../src/models/Bin', () => ({
  create: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

describe('Bin Requests API', () => {
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

  test('POST /bin-requests requires a live photo', async () => {
    const res = await request(app)
      .post('/api/v1/bin-requests')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', 'Park Bin')
      .field('address', 'Near gate')
      .field('lat', '28.61')
      .field('lng', '77.03')
      .field('types', JSON.stringify(['plastic']));

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/photo/i);
  });

  test('POST /bin-requests requires live location', async () => {
    const res = await request(app)
      .post('/api/v1/bin-requests')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', 'Park Bin')
      .field('address', 'Near gate')
      .field('types', JSON.stringify(['plastic']))
      .attach('photo', Buffer.from('fake-image'), 'bin.jpg');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/location/i);
  });

  test('POST /bin-requests creates a pending request', async () => {
    const created = { _id: 'req1', status: 'pending' };
    BinRequest.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/v1/bin-requests')
      .set('Authorization', `Bearer ${userToken}`)
      .field('name', 'Park Bin')
      .field('address', 'Near gate')
      .field('lat', '28.61')
      .field('lng', '77.03')
      .field('types', JSON.stringify(['plastic']))
      .attach('photo', Buffer.from('fake-image'), 'bin.jpg');

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(BinRequest.create).toHaveBeenCalledWith(expect.objectContaining({
      status: 'pending',
      photoUrl: 'https://cloudinary.test/bin.jpg',
    }));
  });

  test('GET /bin-requests rejects non-admin', async () => {
    const res = await request(app)
      .get('/api/v1/bin-requests')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });

  test('GET /bin-requests lists requests for admin', async () => {
    const rows = [{ _id: 'req1', status: 'pending' }];
    BinRequest.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(rows),
        }),
      }),
    });

    const res = await request(app)
      .get('/api/v1/bin-requests?status=pending')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.requests).toEqual(rows);
  });

  test('POST /bin-requests/:id/approve creates bin + awards points once', async () => {
    const pending = {
      _id: 'req1',
      status: 'pending',
      name: 'Park Bin',
      address: 'Near gate',
      location: { coordinates: [77.03, 28.61] },
      types: ['plastic'],
      requestedBy: userId,
      save: jest.fn().mockResolvedValue(true),
    };
    BinRequest.findById.mockResolvedValue(pending);
    Bin.create.mockResolvedValue({ _id: 'bin1' });
    User.findByIdAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue({ ecoPoints: 50, totalPointsEarned: 50 }),
    });

    const res = await request(app)
      .post('/api/v1/bin-requests/req1/approve')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.pointsAwarded).toBe(50);
    expect(Bin.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Park Bin' }));
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      { $inc: { ecoPoints: 50, totalPointsEarned: 50 } },
      expect.any(Object)
    );
    expect(pending.status).toBe('approved');
  });

  test('POST /bin-requests/:id/approve rejects double-approve', async () => {
    BinRequest.findById.mockResolvedValue({ _id: 'req1', status: 'approved' });

    const res = await request(app)
      .post('/api/v1/bin-requests/req1/approve')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(409);
    expect(Bin.create).not.toHaveBeenCalled();
  });

  test('POST /bin-requests/penalty deducts points with floor at 0', async () => {
    const userDoc = { ecoPoints: 10, totalPointsEarned: 30, save: jest.fn().mockResolvedValue(true) };
    User.findById.mockResolvedValue(userDoc);

    const res = await request(app)
      .post('/api/v1/bin-requests/penalty')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId, points: 25, reason: 'fake report' });

    expect(res.statusCode).toBe(200);
    expect(userDoc.ecoPoints).toBe(0);
    expect(userDoc.totalPointsEarned).toBe(5);
  });

  test('POST /bin-requests/penalty validates points range', async () => {
    const res = await request(app)
      .post('/api/v1/bin-requests/penalty')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId, points: 9999 });

    expect(res.statusCode).toBe(400);
  });
});
