const request = require('supertest');
const app = require('../src/app');

describe('GET /health', () => {
  it('should return 200 with {status:\"ok\"}', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /', () => {
  it('should return API root info', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('EcoSankalan');
  });
});

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/doesnotexist');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

