process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const WasteLog = require('../src/models/WasteLog');

jest.mock('../src/models/WasteLog', () => ({
  aggregate: jest.fn(),
}));

describe('GET /api/v1/waste/stats', () => {
  const userId = '507f1f77bcf86cd799439011';
  const token = jwt.sign({ userId, role: 'user' }, process.env.JWT_SECRET);

  beforeEach(() => {
    jest.clearAllMocks();
    WasteLog.aggregate
      .mockResolvedValueOnce([{ totalKg: 12.345, totalCo2Saved: 8.333, totalPointsEarned: 340 }])
      .mockResolvedValueOnce([
        { _id: 'plastic', kg: 3.234 },
        { _id: 'e-waste', kg: 0.5 },
      ])
      .mockResolvedValueOnce([{ _id: '2026-05-28', kg: 1.235 }]);
  });

  test('returns rounded aggregation for week range', async () => {
    const res = await request(app)
      .get('/api/v1/waste/stats?range=week')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.totalKg).toBe(12.35);
    expect(res.body.totalCo2Saved).toBe(8.33);
    expect(res.body.categoryBreakdown.plastic).toBe(3.23);
    expect(res.body.categoryBreakdown.eWaste).toBe(0.5);
    expect(res.body.weeklyTrend).toEqual([{ date: '2026-05-28', kg: 1.24 }]);
  });

  test.each(['month', 'all'])('accepts %s range', async (range) => {
    const res = await request(app)
      .get(`/api/v1/waste/stats?range=${range}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(WasteLog.aggregate).toHaveBeenCalledTimes(3);
  });
});
