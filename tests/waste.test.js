process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
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
  const token = jwt.sign({ userId: 'user123', role: 'user' }, process.env.JWT_SECRET);

  afterEach(() => {
    jest.clearAllMocks();
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
        'user123',
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
