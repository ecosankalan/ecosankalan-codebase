/**
 * lib/appwrite.js
 * Appwrite Web SDK client configuration.
 *
 * Used by the React SDK (@appwrite.io/react) and for direct
 * account operations (JWT creation, session management).
 */

import { Client } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export default client;
