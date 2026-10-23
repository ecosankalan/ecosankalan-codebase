process.env.NODE_ENV = 'test';

const request = require('supertest');

jest.mock('../src/models/MapMarker', () => ({
  countDocuments: jest.fn().mockResolvedValue(5470),
}));
jest.mock('../src/models/User', () => ({
  countDocuments: jest.fn().mockResolvedValue(26),
  aggregate: jest.fn().mockResolvedValue([
    { _id: null, totalPoints: 4520 },
  ]),
}));
jest.mock('../src/models/WasteLog', () => ({
  aggregate: jest.fn().mockResolvedValue([
    { _id: null, wasteKg: 1234.56, logs: 321 },
  ]),
}));

const app = require('../src/app');
const platformRoutes = require('../src/routes/platform');

beforeEach(() => {
  platformRoutes.__resetCache();
  jest.clearAllMocks();
  // Re-arm mocks cleared by clearAllMocks
  require('../src/models/MapMarker').countDocuments.mockResolvedValue(5470);
  require('../src/models/User').countDocuments.mockResolvedValue(26);
  require('../src/models/User').aggregate.mockResolvedValue([
    { _id: null, totalPoints: 4520 },
  ]);
  require('../src/models/WasteLog').aggregate.mockResolvedValue([
    { _id: null, wasteKg: 1234.56, logs: 321 },
  ]);
});

describe('GET /api/v1/platform/stats (public)', () => {
  it('returns aggregate stats without auth', async () => {
    const res = await request(app).get('/api/v1/platform/stats');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toMatchObject({
      binsMapped: 5470,
      ecoWarriors: 26,
      wasteLogs: 321,
      totalPoints: 4520,
    });
    expect(res.body.stats.wasteKg).toBeCloseTo(1234.6, 1);
    expect(res.body.stats.co2SavedKg).toBeUndefined();
  });

  it('serves the second call from cache', async () => {
    await request(app).get('/api/v1/platform/stats');
    const res = await request(app).get('/api/v1/platform/stats');

    expect(res.statusCode).toBe(200);
    expect(res.body.cached).toBe(true);
    expect(require('../src/models/MapMarker').countDocuments).toHaveBeenCalledTimes(1);
  });
});
