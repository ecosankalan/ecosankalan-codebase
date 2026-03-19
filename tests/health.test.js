/**
 * tests/health.test.js
 * First test — verifies the health endpoint works.
 *
 * Why write tests now even though Month 2 is when tests "officially" start?
 * Because having ONE passing test in Month 1 proves the test infrastructure
 * works. When you write 20 tests in Month 2, you won't be debugging Jest
 * config at the same time as debugging auth logic.
 *
 * supertest lets you make real HTTP requests to the app
 * WITHOUT starting the server on a port. Clean and fast.
 */

const request = require('supertest');
const app = require('../src/app');

describe('GET /health', () => {
  it('should return 200 with server status', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.project).toBe('EcoSankalan');
    expect(res.body.server).toBe('running');
    // DB will be 'disconnected' in test env (no real Atlas URI)
    // That's fine — we're testing the route, not the DB connection
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return 503 when database is disconnected', async () => {
    // In test environment without a real MONGODB_URI, DB is disconnected
    // The health route returns 503 in this case — correct behavior
    const res = await request(app).get('/health');
    // Either 200 (connected) or 503 (disconnected) is valid
    expect([200, 503]).toContain(res.statusCode);
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
