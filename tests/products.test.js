process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';
process.env.ALLOWED_REDIRECT_DOMAINS = 'greenkart.example';
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
const PartnerProduct = require('../src/models/PartnerProduct');
const User = require('../src/models/User');

jest.mock('../src/models/PartnerProduct', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

describe('Products API', () => {
  const token = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    User.findOne.mockResolvedValue({ _id: '507f1f77bcf86cd799439011', role: 'user', email: 'test@example.com' });
  });

  test('GET products filters active listings by category', async () => {
    PartnerProduct.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ name: 'Bottle' }]),
      }),
    });

    const res = await request(app).get('/api/v1/products?category=bottles');

    expect(res.statusCode).toBe(200);
    expect(PartnerProduct.find).toHaveBeenCalledWith({ isActive: true, category: 'bottles' });
  });

  test('redirect appends UTM for allowlisted domain', async () => {
    PartnerProduct.findOne.mockResolvedValue({
      partnerProductUrl: 'https://shop.greenkart.example/product/1?ref=x',
    });

    const res = await request(app)
      .get('/api/v1/products/product1/redirect')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toContain('utm_source=ecosankalan');
  });

  test('redirect blocks non-allowlisted domain', async () => {
    PartnerProduct.findOne.mockResolvedValue({
      partnerProductUrl: 'https://evil.example/product/1',
    });

    const res = await request(app)
      .get('/api/v1/products/product1/redirect')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

  test('GET product by id returns active product', async () => {
    PartnerProduct.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: 'product1', name: 'Bottle' }),
    });

    const res = await request(app).get('/api/v1/products/product1');

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Bottle');
  });
});
