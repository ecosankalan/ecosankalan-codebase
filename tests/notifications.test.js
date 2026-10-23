process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';
process.env.APPWRITE_ENDPOINT = 'https://test.cloud.appwrite.io/v1';
process.env.APPWRITE_PROJECT_ID = 'test-project';
process.env.APPWRITE_API_KEY = 'test-api-key';

const request = require('supertest');

// Token-aware mock — different Appwrite identities for admin vs user tokens
jest.mock('node-appwrite', () => {
  let sessionToken = null;

  const adminAccount = {
    get: jest.fn().mockResolvedValue({
      $id: 'appwrite-admin-123',
      email: 'admin@example.com',
      name: 'Admin User',
    }),
  };

  const userAccount = {
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
    setJWT: jest.fn().mockImplementation((token) => {
      sessionToken = token;
      return mockClient;
    }),
    config: {
      endpoint: 'https://test.cloud.appwrite.io/v1',
      project: 'test-project',
    },
    account: jest.fn(() => sessionToken === 'test-admin-token' ? adminAccount : userAccount),
  };

  return {
    Client: jest.fn(() => mockClient),
    Account: mockClient.account,
  };
});

const app = require('../src/app');
const User = require('../src/models/User');
const Notification = require('../src/models/Notification');
const {
  sendMulticastNotification,
  pruneInvalidTokens,
} = require('../src/services/notification');
const NotificationService = require('../src/services/notificationService');

jest.mock('../src/models/User');
jest.mock('../src/models/Notification');
jest.mock('../src/config/cloudinary', () => {
  return jest.fn().mockReturnValue({
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/notif.jpg' }),
    },
  });
});
jest.mock('../src/services/notification', () => ({
  sendNotification: jest.fn(),
  sendMulticastNotification: jest.fn(),
  sendToTopic: jest.fn(),
  subscribeToTopic: jest.fn(),
  unsubscribeFromTopic: jest.fn(),
  pruneInvalidTokens: jest.fn().mockResolvedValue(undefined),
}));

describe('Notification token endpoints', () => {
  const userId = '507f1f77bcf86cd799439011';
  const token = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    User.findOne.mockResolvedValue({ _id: userId, role: 'user', email: 'test@example.com' });
  });

  describe('POST /api/notifications/token', () => {
    it('returns 401 without a JWT', async () => {
      const res = await request(app)
        .post('/api/notifications/token')
        .send({ token: 'new-token' });

      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when token is missing', async () => {
      const res = await request(app)
        .post('/api/notifications/token')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(User.findById).not.toHaveBeenCalled();
    });

    it('returns 404 when the user no longer exists', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .post('/api/notifications/token')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: 'new-token' });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('replaces the existing token (single-device) and saves', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      const userDoc = {
        fcmTokens: [{ token: 'stale-token', device: 'old-device' }],
        save,
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(userDoc),
      });

      const res = await request(app)
        .post('/api/notifications/token')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: 'fresh-token', device: 'jest-agent' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(userDoc.fcmTokens).toHaveLength(1);
      expect(userDoc.fcmTokens[0]).toEqual(
        expect.objectContaining({ token: 'fresh-token', device: 'jest-agent' })
      );
      expect(save).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/notifications/token', () => {
    it('returns 401 without a JWT', async () => {
      const res = await request(app)
        .delete('/api/notifications/token')
        .send({ token: 'old-token' });

      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when token is missing', async () => {
      const res = await request(app)
        .delete('/api/notifications/token')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('$pulls the token from the user document', async () => {
      User.findByIdAndUpdate.mockResolvedValue({});

      const res = await request(app)
        .delete('/api/notifications/token')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: 'old-token' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        $pull: { fcmTokens: { token: 'old-token' } },
      });
    });
  });
});

describe('NotificationService.challengeCreated', () => {
  const challenge = { _id: '507f1f77bcf86cd799439022', title: 'Bottle Week' };

  beforeEach(() => {
    jest.clearAllMocks();
    User.find.mockResolvedValue([]);
    pruneInvalidTokens.mockResolvedValue(undefined);
  });

  it('multicasts to every registered token with a deep-link url', async () => {
    User.find.mockResolvedValue([
      { fcmTokens: [{ token: 'a' }] },
      { fcmTokens: [{ token: 'b' }, { token: 'c' }] },
      { fcmTokens: [] },
    ]);
    sendMulticastNotification.mockResolvedValue({
      successCount: 2,
      failureCount: 1,
      invalidTokens: ['c'],
    });

    const result = await NotificationService.challengeCreated(challenge);

    expect(sendMulticastNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        tokens: ['a', 'b', 'c'],
        title: expect.stringContaining('New Challenge'),
        body: expect.stringContaining('Bottle Week'),
        data: expect.objectContaining({
          type: 'challenge',
          challengeId: '507f1f77bcf86cd799439022',
          url: '/challenge/507f1f77bcf86cd799439022',
        }),
      })
    );
    expect(pruneInvalidTokens).toHaveBeenCalledWith(['c']);
    expect(result).toEqual(expect.objectContaining({ successCount: 2 }));
  });

  it('sends to an empty token list safely when nobody registered', async () => {
    sendMulticastNotification.mockResolvedValue({
      successCount: 0,
      failureCount: 0,
      invalidTokens: [],
    });

    const result = await NotificationService.challengeCreated(challenge);

    expect(sendMulticastNotification).toHaveBeenCalledWith(
      expect.objectContaining({ tokens: [] })
    );
    expect(pruneInvalidTokens).toHaveBeenCalledWith([]);
    expect(result.successCount).toBe(0);
  });

  it('propagates send failures without pruning', async () => {
    sendMulticastNotification.mockRejectedValue(new Error('firebase down'));

    await expect(NotificationService.challengeCreated(challenge)).rejects.toThrow(
      'firebase down'
    );
    expect(pruneInvalidTokens).not.toHaveBeenCalled();
  });
});
