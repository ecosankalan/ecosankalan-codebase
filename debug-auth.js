process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';
process.env.APPWRITE_ENDPOINT = 'https://test.cloud.appwrite.io/v1';
process.env.APPWRITE_PROJECT_ID = 'test-project';
process.env.APPWRITE_API_KEY = 'test-api-key';

// Mock node-appwrite
jest = { mock: () => {} };
const mockGet = jest.fn = () => Promise.resolve({$id:'aw-123',email:'test@example.com',name:'Test User'});
const mockAccount = { get: () => Promise.resolve({$id:'aw-123',email:'test@example.com',name:'Test User'}) };
const mockClient = {
  setEndpoint: function() { return this; },
  setProject: function() { return this; },
  setKey: function() { return this; },
  setSession: function() { return this; },
  config: { endpoint: 'https://test.cloud.appwrite.io/v1', project: 'test-project' },
  account: function() { return mockAccount; },
};

// Clear all caches
Object.keys(require.cache).forEach(k => {
  delete require.cache[k];
});

// Intercept module loading
const Module = require('module');
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'node-appwrite') {
    return {
      Client: function() { return mockClient; },
      Account: function() { return mockAccount; }
    };
  }
  return originalLoad.apply(this, arguments);
};

const app = require('./src/app');
const http = require('http');

const server = app.listen(0, () => {
  const port = server.address().port;

  // Test 1: sync with token
  const req1 = http.request({
    hostname: 'localhost', port,
    path: '/api/v1/auth/sync',
    method: 'POST',
    headers: { 'Authorization': 'Bearer test-token', 'Content-Type': 'application/json' }
  }, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log('POST /api/v1/auth/sync:', res.statusCode, body.substring(0, 200));

      // Test 2: me with token
      const req2 = http.request({
        hostname: 'localhost', port,
        path: '/api/v1/auth/me',
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' }
      }, (res2) => {
        let body2 = '';
        res2.on('data', d => body2 += d);
        res2.on('end', () => {
          console.log('GET /api/v1/auth/me:', res2.statusCode, body2.substring(0, 200));
          server.close();
        });
      });
      req2.end();
    });
  });
  req1.write('{}');
  req1.end();
});
