process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');

jest.mock('../src/models/User', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

describe('User Profile API', () => {
  let token;
  const mockUserId = '507f1f77bcf86cd799439011';

  beforeAll(() => {
    token = jwt.sign(
      { userId: mockUserId, role: 'user' }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /user/profile should return 200 and user data', async () => {
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
    const res = await request(app)
      .put('/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'hacker@gmail.com' });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Field not updatable post-registration');
  });
});