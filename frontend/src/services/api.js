/**
 * frontend/src/services/api.js
 * Central Axios instance + all API call functions.
 *
 * All requests are automatically authenticated via the JWT
 * interceptor below — pages just import and call the function,
 * no need to manually attach tokens.
 *
 * Base URL is set by VITE_API_URL env var (defaults to localhost:5000).
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// ── Auto-attach JWT token to every request ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
// AUTH
// ════════════════════════════════════════════════════════════════════════════
export const registerUser  = (data) => api.post('/api/v1/auth/register', data);
export const verifyOTP     = (data) => api.post('/api/v1/auth/verify-otp', data); // Stub to prevent OTPForm crash
export const loginUser     = (data) => api.post('/api/v1/auth/login', data);
export const authGoogle    = (data) => api.post('/api/v1/auth/google', data);
export const forgotPassword = (data) => api.post('/api/v1/auth/forgot-password', data);
export const resetPassword  = (data) => api.post('/api/v1/auth/reset-password', data);

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

/**
 * POST /waste/log
 * Body: { category, quantity, unit?, description?, logMethod? }
 * Returns: { success, log, pointsEarned, co2Saved }
 */
export const logWaste = (data) => api.post('/api/v1/waste/log', data);

/**
 * GET /waste/history?category=&page=&limit=
 * Returns: { logs: [], pagination: { page, limit, total, pages } }
 */
export const getWasteHistory = (params = {}) =>
  api.get('/api/v1/waste/history', { params });

/**
 * GET /waste/stats?range=week|month|all
 * Returns: { totalKg, totalCo2Saved, totalPointsEarned, categoryBreakdown, weeklyTrend }
 */
export const getWasteStats = (range = 'week') =>
  api.get('/api/v1/waste/stats', { params: { range } });

/**
 * POST /waste/scan  (AI image scan)
 * Body: FormData with key "images" (file upload)
 * Returns: { success, model, usage, parsed: { label, category, material, confidence, steps } }
 */
export const scanWasteImage = (formData) =>
  api.post('/api/v1/waste/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ════════════════════════════════════════════════════════════════════════════
// BINS  (FR-11, FR-12)
// ════════════════════════════════════════════════════════════════════════════

/**
 * GET /bins?lat=&lng=&radius=
 * Returns sorted array of bins nearest-first with distanceMetres field
 */
export const getNearbyBins = ({ lat, lng, radius = 5000 }) =>
  api.get('/api/v1/bins', { params: { lat, lng, radius } });

/**
 * POST /bins  (Admin only)
 * Body: { name, address, location: { type, coordinates }, types[], capacityStatus }
 */
export const createBin = (data) => api.post('/api/v1/bins', data);

// ════════════════════════════════════════════════════════════════════════════
// MAP MARKERS  (from DB — no direct OSM calls)
// ════════════════════════════════════════════════════════════════════════════

/**
 * GET /markers?north=&south=&east=&west=&categories=
 * Returns waste location markers within the bounding box
 */
export const getMapMarkers = (bounds) =>
  api.get('/api/v1/markers', { params: bounds });

// ════════════════════════════════════════════════════════════════════════════
// EVENTS  (FR-13, FR-14)
// ════════════════════════════════════════════════════════════════════════════

/**
 * GET /events/upcoming
 * Returns events sorted chronologically, cancelled excluded
 */
export const getUpcomingEvents = () => api.get('/api/v1/events/upcoming');

/**
 * POST /events  (Admin / NGO only)
 * Body: { title, description, address, location, eventDate, organiser, bonusPoints }
 */
export const createEvent = (data) => api.post('/api/v1/events', data);

/**
 * POST /events/:id/rsvp
 * Returns: { success, message, pointsAwarded }
 * 409 if already RSVP'd
 */
export const rsvpEvent = (eventId) => api.post(`/api/v1/events/${eventId}/rsvp`);

// ════════════════════════════════════════════════════════════════════════════
// CHALLENGES  (FR-21, FR-22, FR-23)
// ════════════════════════════════════════════════════════════════════════════

/**
 * GET /challenges/active
 * Returns active challenges with per-user summary progress and today's dayIndex.
 */
export const getActiveChallenges = () => api.get('/api/v1/challenges/active');

/**
 * GET /challenges/:id
 * Returns full challenge with computed daily slots and the requester's submissions.
 */
export const getChallengeById = (id) => api.get(`/api/v1/challenges/${id}`);

/**
 * POST /challenges/:id/submit
 * Body: multipart form-data with fields `dayIndex`, optional `remarks`, optional `image` file.
 * Returns: { success, progress, totalPoints, allCompleted }
 */
export const submitChallengeTask = (id, formData) =>
  api.post(`/api/v1/challenges/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * GET /challenges/:id/leaderboard
 * Returns { top10, currentUser, total } sorted by totalPoints desc.
 */
export const getChallengeLeaderboard = (id) =>
  api.get(`/api/v1/challenges/${id}/leaderboard`);

// ════════════════════════════════════════════════════════════════════════════
// PRODUCTS / ECO-SHOP  (FR-16, FR-17)
// ════════════════════════════════════════════════════════════════════════════

/**
 * GET /products?category=
 * Returns active partner products, optionally filtered by category
 */
export const getProducts = (category) =>
  api.get('/api/v1/products', { params: category ? { category } : {} });

/**
 * GET /products/:id
 * Returns a single product
 */
export const getProductById = (id) => api.get(`/api/v1/products/${id}`);

/**
 * GET /products/:id/redirect  (returns 302, open in new tab from JS)
 * We build the URL here and open it — no axios needed for a redirect
 */
export const getProductRedirectUrl = (id) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${base}/api/v1/products/${id}/redirect`;
};

// ════════════════════════════════════════════════════════════════════════════
// VOUCHERS  (FR-18, FR-19)
// ════════════════════════════════════════════════════════════════════════════

/**
 * GET /vouchers/my
 * Returns all vouchers assigned to the authenticated user (active first)
 */
export const getMyVouchers = () => api.get('/api/v1/vouchers/my');

/**
 * POST /vouchers/unlock
 * Body: { partnerName }
 * Returns the newly assigned voucher, or 409 if none available / 400 if insufficient points
 */
export const unlockVoucher = (partnerName) =>
  api.post('/api/v1/vouchers/unlock', { partnerName });

// ════════════════════════════════════════════════════════════════════════════
// CHALLENGES — ADMIN
// ════════════════════════════════════════════════════════════════════════════

/**
 * POST /challenges — Admin creates a new challenge
 */
export const createChallenge = (data) => api.post('/api/v1/challenges', data);

/**
 * PUT /challenges/:id — Admin updates a challenge
 */
export const updateChallenge = (id, data) => api.put(`/api/v1/challenges/${id}`, data);

/**
 * DELETE /challenges/:id — Admin soft-deletes a challenge
 */
export const deleteChallenge = (id) => api.delete(`/api/v1/challenges/${id}`);

/**
 * GET /challenges/admin — Admin lists all challenges
 */
export const getAdminChallenges = () => api.get('/api/v1/challenges/admin');

/**
 * POST /challenges/:id/join — User joins a challenge
 */
export const joinChallenge = (challengeId) => api.post(`/api/v1/challenges/${challengeId}/join`);

// ════════════════════════════════════════════════════════════════════════════
// ADMIN  (FR-20, FR-25)
// ════════════════════════════════════════════════════════════════════════════

/** GET /admin/stats — platform-wide aggregated stats */
export const getAdminStats = () => api.get('/api/v1/admin/stats');

/** GET /admin/vouchers/stats — per-partner issued/assigned/remaining */
export const getAdminVoucherStats = () => api.get('/api/v1/admin/vouchers/stats');

/** POST /admin/vouchers — bulk import voucher array */
export const bulkImportVouchers = (vouchers) =>
  api.post('/api/v1/admin/vouchers', vouchers);

/** GET /admin/leaderboard — global user ranking by points */
export const getAdminLeaderboard = (limit = 20) =>
  api.get('/api/v1/admin/leaderboard', { params: { limit } });

// ════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS  (admin broadcast + history)
// ════════════════════════════════════════════════════════════════════════════

/** POST /notifications/broadcast — send push notification to all users */
export const broadcastNotification = (title, body) =>
  api.post('/api/notifications/broadcast', { title, body });

/** GET /notifications — paginated notification history (admin) */
export const getNotifications = (params = {}) =>
  api.get('/api/notifications', { params });

// ════════════════════════════════════════════════════════════════════════════
// AI SCAN  (direct to /api/v1/ai/analyze — alternate endpoint)
// ════════════════════════════════════════════════════════════════════════════

/**
 * POST /ai/analyze
 * Same as /waste/scan — upload images via multipart/form-data key "images"
 */
export const analyzeWasteAI = (formData) =>
  api.post('/api/v1/ai/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Default export for direct api instance usage
export default api;
