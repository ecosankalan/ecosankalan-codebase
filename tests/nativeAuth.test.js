process.env.NODE_ENV = 'test';
process.env.APPWRITE_ENDPOINT = 'https://test.cloud.appwrite.io/v1';
process.env.APPWRITE_PROJECT_ID = 'test-project';
process.env.APPWRITE_API_KEY = 'test-api-key';
process.env.GOOGLE_CLIENT_ID = 'web-client.apps.googleusercontent.com';
process.env.GOOGLE_ANDROID_CLIENT_ID = 'android-client.apps.googleusercontent.com';
process.env.CLIENT_URL = 'https://app.test';

// ── Mocks MUST come before app require ──────────────────────────────────────

const mockVerify = jest.fn();
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn(() => ({ verifyIdToken: mockVerify })),
}));

const mockUsers = {
  list: jest.fn(),
  create: jest.fn(),
  createToken: jest.fn(),
};
jest.mock('node-appwrite', () => {
  const mockClient = {
    setEndpoint: jest.fn().mockReturnThis(),
    setProject: jest.fn().mockReturnThis(),
    setKey: jest.fn().mockReturnThis(),
  };
  return {
    Client: jest.fn(() => mockClient),
    Account: jest.fn(),
    Users: jest.fn(() => mockUsers),
    Query: { equal: jest.fn((a, b) => ({ attr: a, val: b })) },
    ID: { unique: jest.fn(() => 'new-appwrite-id') },
  };
});

jest.mock('../src/models/User');

const request = require('supertest');
const app = require('../src/app');

const goodPayload = {
  email: 'native@example.com',
  name: 'Native User',
  email_verified: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockVerify.mockResolvedValue({ getPayload: () => ({ ...goodPayload }) });
  mockUsers.list.mockResolvedValue({ total: 0, users: [] });
  mockUsers.create.mockResolvedValue({ $id: 'new-appwrite-id' });
  mockUsers.createToken.mockResolvedValue({ userId: 'new-appwrite-id', secret: 'tok-secret' });
});

describe('GET /api/v1/auth/google/native-callback (Median native login)', () => {
  it('redirects existing Appwrite user to frontend success with token', async () => {
    mockUsers.list.mockResolvedValue({
      total: 1,
      users: [{ $id: 'existing-id', email: 'native@example.com' }],
    });
    mockUsers.createToken.mockResolvedValue({ userId: 'existing-id', secret: 's3cr3t' });

    const res = await request(app).get(
      '/api/v1/auth/google/native-callback?idToken=google-id-token'
    );

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(
      'https://app.test/auth/success?userId=existing-id&secret=s3cr3t'
    );
    expect(mockUsers.create).not.toHaveBeenCalled();
  });

  it('creates the Appwrite user on first native login then redirects', async () => {
    const res = await request(app).get(
      '/api/v1/auth/google/native-callback?idToken=google-id-token'
    );

    expect(res.statusCode).toBe(302);
    expect(mockUsers.create).toHaveBeenCalledWith(
      'new-appwrite-id',
      'native@example.com',
      undefined,
      undefined,
      'Native User'
    );
    expect(res.headers.location).toContain('/auth/success?userId=new-appwrite-id');
  });

  it('redirects to failure when Google reports an error', async () => {
    const res = await request(app).get(
      '/api/v1/auth/google/native-callback?error=access_denied'
    );

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('https://app.test/auth/failure');
    expect(mockVerify).not.toHaveBeenCalled();
  });

  it('redirects to failure for unverified email', async () => {
    mockVerify.mockResolvedValue({
      getPayload: () => ({ ...goodPayload, email_verified: false }),
    });

    const res = await request(app).get(
      '/api/v1/auth/google/native-callback?idToken=google-id-token'
    );

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('https://app.test/auth/failure');
  });

  it('redirects to failure when token verification throws', async () => {
    mockVerify.mockRejectedValue(new Error('Invalid token'));

    const res = await request(app).get(
      '/api/v1/auth/google/native-callback?idToken=bogus'
    );

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('https://app.test/auth/failure');
  });
});
