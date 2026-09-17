/**
 * config/appwrite.js
 * Appwrite server-side client for user verification and management.
 *
 * Uses the server API key (APPWRITE_API_KEY) — never exposed to the frontend.
 * Client is created lazily on first use via getClient() to avoid issues
 * with import-time env var resolution (e.g., in tests).
 */

const sdk = require('node-appwrite');

let _client = null;

function getClient() {
  if (!_client) {
    _client = new sdk.Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
  }
  return _client;
}

module.exports = { getClient, sdk };
