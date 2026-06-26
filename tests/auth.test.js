process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');

jest.mock('../src/models/User');

describe('Auth & User Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        ecoPoints: 0
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phone: '9876543210',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should return 400 if user exists', async () => {
      User.findOne.mockResolvedValue({ _id: 'user123' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phone: '9876543210',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        ecoPoints: 0,
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      const mockUser = {
        _id: 'user123',
        comparePassword: jest.fn().mockResolvedValue(false)
      };
      
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('User Profile Routes', () => {
    const token = jwt.sign({ userId: 'user123', role: 'user' }, process.env.JWT_SECRET);

    it('GET /api/v1/users/profile - should return profile', async () => {
      User.findById.mockResolvedValue({ _id: 'user123', name: 'Test User' });

      const res = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Test User');
    });

    it('PUT /api/v1/users/profile - should update profile', async () => {
      User.findByIdAndUpdate.mockResolvedValue({ _id: 'user123', name: 'New Name' });

      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('New Name');
    });

    it('PUT /api/v1/users/profile - should block email updates', async () => {
      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'new@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/not updatable/);
    });
  });
});
