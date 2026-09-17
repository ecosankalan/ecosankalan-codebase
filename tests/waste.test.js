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

jest.mock('../src/models/WasteLog');
jest.mock('../src/models/User');
jest.mock('../src/config/cloudinary', () => {
  return jest.fn().mockReturnValue({
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/waste.jpg' })
    }
  });
});

describe('Waste Logging Routes', () => {
  const userId = '507f1f77bcf86cd799439011';
  const token = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    User.findOne.mockResolvedValue({ _id: userId, role: 'user', email: 'test@example.com' });
  });

  describe('POST /api/v1/waste/log', () => {
    it('should log waste successfully and award points', async () => {
      WasteLog.create.mockResolvedValue({
        _id: 'log123',
        category: 'plastic',
        quantity: 2,
        pointsEarned: 10,
        co2Saved: 5.0
      });

      User.findByIdAndUpdate.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/waste/log')
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'plastic',
          quantity: 2
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.pointsEarned).toBe(10);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          $inc: expect.objectContaining({
            ecoPoints: 10
          })
        })
      );
    });

    it('should return 400 for invalid category', async () => {
      const res = await request(app)
        .post('/api/v1/waste/log')
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'invalid_cat',
          quantity: 2
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 if no JWT token provided', async () => {
      const res = await request(app)
        .post('/api/v1/waste/log')
        .send({
          category: 'plastic',
          quantity: 2
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/waste/history', () => {
    it('should return paginated waste history', async () => {
      WasteLog.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                { _id: 'log1', category: 'plastic' }
              ])
            })
          })
        })
      });
      WasteLog.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/waste/history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.logs.length).toBe(1);
      expect(res.body.pagination.total).toBe(1);
    });
  });
});
