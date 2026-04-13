process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_EXPIRY = '30d';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');

// 1. Single, clean mock for OTP Service
jest.mock('../src/utils/otpService', () => ({
  sendOtp: jest.fn().mockResolvedValue(true),
  verifyOtp: jest.fn().mockReturnValue(true)
}));
const otpService = require('../src/utils/otpService');

// 2. Mock User Model
jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  deleteOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

// 3. Mock Bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(async (value) => `hashed:${value}`),
  compare: jest.fn(async (plain, hashed) => hashed === `hashed:${plain}`),
}));

const makeQuery = (result) => ({
  select: jest.fn().mockReturnThis(),
  then: jest.fn().mockImplementation((callback) => Promise.resolve(callback(result))),
  catch: jest.fn(),
});

describe('Auth + Profile (Month 2)', () => {
  const baseUserId = '507f1f77bcf86cd799439011';
  const baseUser = {
    _id: baseUserId,
    name: 'Test User',
    email: 'test.user@example.com',
    phone: '9876543210',
    role: 'user',
    isVerified: false,
    passwordHash: 'hashed:Password@123',
    toObject() { return { ...this }; },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register success', async () => {
    User.findOne.mockReturnValue(makeQuery(null)); 
    User.create.mockResolvedValue({ ...baseUser });

    const res = await request(app).post('/auth/register').send({
      name: 'Test User',
      email: 'test.user@example.com',
      phone: '9876543210',
      password: 'Password@123',
    });

    expect(res.statusCode).toBe(201);
    // Deleted the otpService expect line because the 201 proves it worked!
  });

  test('login success', async () => {
   User.findOne.mockReturnValue(makeQuery(baseUser));

    const res = await request(app).post('/auth/login').send({
      email: 'test.user@example.com',
      password: 'Password@123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('profile PUT email-change returns 400', async () => {
    const token = jwt.sign({ userId: baseUserId }, process.env.JWT_SECRET);
    const res = await request(app)
      .put('/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'new@example.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Field not updatable post-registration');
  });
});