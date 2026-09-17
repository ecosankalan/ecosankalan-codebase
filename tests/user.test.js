process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';
process.env.APPWRITE_ENDPOINT = 'https://test.cloud.appwrite.io/v1';
process.env.APPWRITE_PROJECT_ID = 'test-project';
process.env.APPWRITE_API_KEY = 'test-api-key';

const request = require('supertest');

// Mock node-appwrite for the protect middleware
jest.mock('node-appwrite', () => {
  const mockAccount = {
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
    setJWT: jest.fn().mockReturnThis(),
    config: {
      endpoint: 'https://test.cloud.appwrite.io/v1',
      project: 'test-project',
    },
    account: jest.fn(() => mockAccount),
  };
  return {
    Client: jest.fn(() => mockClient),
    Account: mockClient.account,
  };
});

const app = require('../src/app');
const User = require('../src/models/User');

jest.mock('../src/models/User', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOne: jest.fn(),
}));

describe('User Profile API', () => {
  let token;
  const mockUserId = '507f1f77bcf86cd799439011';

  beforeAll(() => {
    token = 'test-token';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /user/profile should return 200 and user data', async () => {
    User.findOne.mockResolvedValue({ _id: mockUserId, role: 'user', email: 'test@example.com' });
    const mockUser = { 
      _id: mockUserId, 
      email: 'ayushfinal@gmail.com', 
      name: 'Ayush' 
    };

    // Bulletproof mock: handles both `await User.findById()` AND `await User.findById().select()`
    User.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser),
      then: function(resolve) { return Promise.resolve(mockUser).then(resolve); }
    }));

    const res = await request(app)
      .get('/user/profile')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('email', 'ayushfinal@gmail.com');
  });

  test('PUT /user/profile should block email updates', async () => {
    User.findOne.mockResolvedValue({ _id: mockUserId, role: 'user', email: 'test@example.com' });
    const res = await request(app)
      .put('/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'hacker@gmail.com' });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Field not updatable post-registration');
  });
});
