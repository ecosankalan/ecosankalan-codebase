process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');
const Voucher = require('../src/models/Voucher');

jest.mock('../src/models/User', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../src/models/Voucher', () => ({
  aggregate: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

describe('Vouchers API', () => {
  const userId = '507f1f77bcf86cd799439011';
  const token = jwt.sign({ userId, role: 'user' }, process.env.JWT_SECRET);

  beforeEach(() => jest.clearAllMocks());

  const mockUserQuery = (user) => ({
    select: jest.fn().mockResolvedValue(user),
  });

  test('unlock succeeds and deducts points after voucher assignment', async () => {
    User.findById.mockReturnValue(mockUserQuery({ _id: userId, ecoPoints: 500 }));
    Voucher.findOneAndUpdate.mockResolvedValue({ _id: 'voucher1', partnerName: 'GreenKart' });
    User.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app)
      .post('/api/v1/vouchers/unlock')
      .set('Authorization', `Bearer ${token}`)
      .send({ partnerName: 'GreenKart' });

    expect(res.statusCode).toBe(200);
    expect(Voucher.findOneAndUpdate).toHaveBeenCalledWith(
      { assignedTo: null, partnerName: 'GreenKart' },
      expect.any(Object),
      expect.objectContaining({ new: true })
    );
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, { $inc: { ecoPoints: -500 } });
  });

  test('GET my returns assigned vouchers active first', async () => {
    Voucher.aggregate.mockResolvedValue([{ code: 'GREEN1', isExpired: false }]);

    const res = await request(app)
      .get('/api/v1/vouchers/my')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ code: 'GREEN1', isExpired: false }]);
    expect(Voucher.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ $match: expect.any(Object) }),
      expect.objectContaining({ $sort: { isExpired: 1, expiresAt: 1 } }),
    ]));
  });

  test('unlock with insufficient points returns 400 and does not assign voucher', async () => {
    User.findById.mockReturnValue(mockUserQuery({ _id: userId, ecoPoints: 100 }));

    const res = await request(app)
      .post('/api/v1/vouchers/unlock')
      .set('Authorization', `Bearer ${token}`)
      .send({ partnerName: 'GreenKart' });

    expect(res.statusCode).toBe(400);
    expect(Voucher.findOneAndUpdate).not.toHaveBeenCalled();
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('unlock with empty pool returns 409 and does not deduct points', async () => {
    User.findById.mockReturnValue(mockUserQuery({ _id: userId, ecoPoints: 500 }));
    Voucher.findOneAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/vouchers/unlock')
      .set('Authorization', `Bearer ${token}`)
      .send({ partnerName: 'GreenKart' });

    expect(res.statusCode).toBe(409);
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});
