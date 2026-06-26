process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const Bin = require('../src/models/Bin');

jest.mock('../src/models/Bin', () => ({
  find: jest.fn(),
  create: jest.fn(),
}));

describe('Bins API', () => {
  const userToken = jwt.sign({ userId: '507f1f77bcf86cd799439011', role: 'user' }, process.env.JWT_SECRET);
  const adminToken = jwt.sign({ userId: '507f1f77bcf86cd799439012', role: 'admin' }, process.env.JWT_SECRET);

  beforeEach(() => jest.clearAllMocks());

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
