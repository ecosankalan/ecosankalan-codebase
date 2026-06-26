process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const Event = require('../src/models/Event');
const User = require('../src/models/User');

jest.mock('../src/models/Event', () => ({
  find: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  updateOne: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  findByIdAndUpdate: jest.fn(),
}));

describe('Events API', () => {
  const userId = '507f1f77bcf86cd799439011';
  const userToken = jwt.sign({ userId, role: 'user' }, process.env.JWT_SECRET);
  const adminToken = jwt.sign({ userId, role: 'admin' }, process.env.JWT_SECRET);

  beforeEach(() => jest.clearAllMocks());

  test('GET upcoming excludes cancelled/past through query and hides rsvpList', async () => {
    const lean = jest.fn().mockResolvedValue([
      { _id: 'event1', title: 'Drive', rsvpList: [userId], eventDate: new Date() },
    ]);
    const sort = jest.fn().mockReturnValue({ lean });
    Event.find.mockReturnValue({ sort });

    const res = await request(app).get('/api/v1/events/upcoming');

    expect(res.statusCode).toBe(200);
    expect(Event.find).toHaveBeenCalledWith(expect.objectContaining({
      isCancelled: false,
      eventDate: expect.objectContaining({ $gte: expect.any(Date) }),
    }));
    expect(res.body[0].rsvpCount).toBe(1);
    expect(res.body[0].rsvpList).toBeUndefined();
  });

  test('POST /events rejects past dates', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Past',
        description: 'Past event',
        address: 'NSUT',
        location: { coordinates: [77, 28] },
        eventDate: '2020-01-01T00:00:00.000Z',
        organiser: 'Eco Club',
      });

    expect(res.statusCode).toBe(400);
  });

  test('POST /events creates future event for admin', async () => {
    Event.create.mockResolvedValue({
      toObject: () => ({
        _id: 'event2',
        title: 'Future',
        rsvpList: [],
      }),
    });

    const res = await request(app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Future',
        description: 'Future event',
        address: 'NSUT',
        location: { coordinates: [77, 28] },
        eventDate: new Date(Date.now() + 86400000).toISOString(),
        organiser: 'Eco Club',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.rsvpCount).toBe(0);
  });

  test('RSVP duplicate returns 409', async () => {
    Event.findById.mockResolvedValue({
      _id: 'event1',
      isCancelled: false,
      eventDate: new Date(Date.now() + 86400000),
      rsvpList: [userId],
      bonusPoints: 50,
    });

    const res = await request(app)
      .post('/api/v1/events/event1/rsvp')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(409);
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('RSVP credits points on first RSVP', async () => {
    Event.findById.mockResolvedValue({
      _id: 'event1',
      isCancelled: false,
      eventDate: new Date(Date.now() + 86400000),
      rsvpList: [],
      bonusPoints: 50,
    });
    Event.updateOne.mockResolvedValue({ modifiedCount: 1 });
    User.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app)
      .post('/api/v1/events/event1/rsvp')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
      $inc: { ecoPoints: 50, totalPointsEarned: 50 },
    });
  });
});
