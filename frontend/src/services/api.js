/**
 * frontend/src/services/api.js
 * Central Axios instance + all API call functions.
 *
 * Authentication is handled by Appwrite:
 *   - On each request, an Appwrite JWT is created via account.createJWT()
 *   - The JWT is attached as a Bearer token
 *   - The backend verifies the JWT via node-appwrite
 *
 * Base URL is set by VITE_API_URL env var (defaults to localhost:5000).
 */

import axios from 'axios';
import { Account } from 'appwrite';
import appwriteClient from '../lib/appwrite';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// ── Auto-attach Appwrite JWT to every request ────────────────────────────────
// Uses the shared Appwrite client from lib/appwrite.js which is configured
// with the same endpoint/projectId as the AppwriteProvider. Sessions created
// by useSignIn/useSignUp are stored in localStorage and accessible here.
api.interceptors.request.use(async (config) => {
  try {
    const account = new Account(appwriteClient);
    const jwtResponse = await account.createJWT();
    config.headers.Authorization = `Bearer ${jwtResponse.jwt}`;
  } catch (err) {
    // Log for debugging — the request will go without auth (backend returns 401)
    if (import.meta.env.DEV) {
      console.warn('[api] createJWT failed:', err?.message || err);
    }
  }
  return config;
});

// ── Response error interceptor: strip axios wrapper for consistency ──────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Re-throw with a clean error message
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      'Network error. Please check your connection.';
    return Promise.reject(new Error(msg));
  }
);

// ════════════════════════════════════════════════════════════════════════════
// AUTH — Appwrite integration
// ════════════════════════════════════════════════════════════════════════════

/**
 * POST /auth/sync
 * Called after Appwrite authentication to sync with MongoDB.
 * Returns the MongoDB user profile.
 */
export const syncUser = () => api.post('/api/v1/auth/sync');

/**
 * GET /auth/me
 * Returns the current authenticated user's MongoDB profile.
 */
export const getMe = () => api.get('/api/v1/auth/me');

// ════════════════════════════════════════════════════════════════════════════
// USER PROFILE
// ════════════════════════════════════════════════════════════════════════════
export const getProfile    = ()     => api.get('/api/v1/users/profile');
export const updateProfile = (data) => api.put('/api/v1/users/profile', data);
export const uploadAvatar  = (formData) => api.put('/api/v1/users/profile/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// ════════════════════════════════════════════════════════════════════════════
// WASTE  (FR-03, FR-04, FR-05 + M3 carryover FR stats)
// ════════════════════════════════════════════════════════════════════════════

export const logWaste = (data) => api.post('/api/v1/waste/log', data);

export const getWasteHistory = (params = {}) =>
  api.get('/api/v1/waste/history', { params });

export const getWasteStats = (range = 'week') =>
  api.get('/api/v1/waste/stats', { params: { range } });

export const scanWasteImage = (formData) =>
  api.post('/api/v1/waste/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ════════════════════════════════════════════════════════════════════════════
// BINS  (FR-11, FR-12)
// ════════════════════════════════════════════════════════════════════════════

export const getNearbyBins = ({ lat, lng, radius = 5000 }) =>
  api.get('/api/v1/bins', { params: { lat, lng, radius } });

export const createBin = (data) => api.post('/api/v1/bins', data);

// ════════════════════════════════════════════════════════════════════════════
// MAP MARKERS  (from DB — no direct OSM calls)
// ════════════════════════════════════════════════════════════════════════════

export const getMapMarkers = (bounds) =>
  api.get('/api/v1/markers', { params: bounds });

// ════════════════════════════════════════════════════════════════════════════
// EVENTS  (FR-13, FR-14)
// ════════════════════════════════════════════════════════════════════════════

export const getUpcomingEvents = () => api.get('/api/v1/events/upcoming');

export const createEvent = (data) => api.post('/api/v1/events', data);

export const rsvpEvent = (eventId) => api.post(`/api/v1/events/${eventId}/rsvp`);

// ════════════════════════════════════════════════════════════════════════════
// CHALLENGES  (FR-21, FR-22, FR-23)
// ════════════════════════════════════════════════════════════════════════════

export const getActiveChallenges = () => api.get('/api/v1/challenges/active');

export const getChallengeById = (id) => api.get(`/api/v1/challenges/${id}`);

export const submitChallengeTask = (id, formData) =>
  api.post(`/api/v1/challenges/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getChallengeLeaderboard = (id) =>
  api.get(`/api/v1/challenges/${id}/leaderboard`);

// ════════════════════════════════════════════════════════════════════════════
// PRODUCTS / ECO-SHOP  (FR-16, FR-17)
// ════════════════════════════════════════════════════════════════════════════

export const getProducts = (category) =>
  api.get('/api/v1/products', { params: category ? { category } : {} });

export const getProductById = (id) => api.get(`/api/v1/products/${id}`);

export const getProductRedirectUrl = (id) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${base}/api/v1/products/${id}/redirect`;
};

// ════════════════════════════════════════════════════════════════════════════
// VOUCHERS  (FR-18, FR-19)
// ════════════════════════════════════════════════════════════════════════════

export const getMyVouchers = () => api.get('/api/v1/vouchers/my');

export const unlockVoucher = (partnerName) =>
  api.post('/api/v1/vouchers/unlock', { partnerName });

// ════════════════════════════════════════════════════════════════════════════
// CHALLENGES — ADMIN
// ════════════════════════════════════════════════════════════════════════════

export const createChallenge = (data) => api.post('/api/v1/challenges', data);

export const updateChallenge = (id, data) => api.put(`/api/v1/challenges/${id}`, data);

export const deleteChallenge = (id) => api.delete(`/api/v1/challenges/${id}`);

export const getAdminChallenges = () => api.get('/api/v1/challenges/admin');

export const joinChallenge = (challengeId) => api.post(`/api/v1/challenges/${challengeId}/join`);

// ════════════════════════════════════════════════════════════════════════════
// ADMIN  (FR-20, FR-25)
// ════════════════════════════════════════════════════════════════════════════

export const getAdminStats = () => api.get('/api/v1/admin/stats');

export const getAdminVoucherStats = () => api.get('/api/v1/admin/vouchers/stats');

export const bulkImportVouchers = (vouchers) =>
  api.post('/api/v1/admin/vouchers', vouchers);

export const getAdminLeaderboard = (limit = 20) =>
  api.get('/api/v1/admin/leaderboard', { params: { limit } });

// ════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS  (admin broadcast + history)
// ════════════════════════════════════════════════════════════════════════════

export const broadcastNotification = (title, body) =>
  api.post('/api/notifications/broadcast', { title, body });

export const getNotifications = (params = {}) =>
  api.get('/api/notifications', { params });

// ════════════════════════════════════════════════════════════════════════════
// AI SCAN  (direct to /api/v1/ai/analyze — alternate endpoint)
// ════════════════════════════════════════════════════════════════════════════

export const analyzeWasteAI = (formData) =>
  api.post('/api/v1/ai/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Default export for direct api instance usage
export default api;
