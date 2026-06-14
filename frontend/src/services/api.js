import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Auto-attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── ✅ REAL API calls (Month 2 — wired up) ──────────────────────────
export const registerUser = (data) => api.post('/api/v1/auth/register', data);
export const verifyOTP    = (data) => api.post('/api/v1/auth/verify-otp', data);
export const loginUser    = (data) => api.post('/api/v1/auth/login', data);
export const getProfile   = ()     => api.get('/api/v1/users/profile');
export const scanWasteImage = (formData) => api.post('/api/v1/ai/analyze', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// ── 📊 MOCK data (static for now, swap with real calls later) ────────
export const getMockDashboardStats = () => ({
  totalWaste: '124 kg',
  co2Saved:   '36 kg',
  ecoPoints:  480,
  eventsJoined: 3,
});

export const getMockWasteHistory = () => ([
  { id: 1, type: 'Plastic',  weight: '2.4 kg', date: '24 Mar 2026', points: 24 },
  { id: 2, type: 'Paper',    weight: '1.1 kg', date: '22 Mar 2026', points: 11 },
  { id: 3, type: 'Organic',  weight: '3.0 kg', date: '20 Mar 2026', points: 15 },
  { id: 4, type: 'E-Waste',  weight: '0.5 kg', date: '18 Mar 2026', points: 20 },
]);

export const getMockProducts = () => ([
  { id: 1, name: 'Recycled Tote Bag',      price: 199, points: 50,  category: 'Bags' },
  { id: 2, name: 'Bamboo Toothbrush Set',  price: 99,  points: 20,  category: 'Personal Care' },
  { id: 3, name: 'Seed Paper Notebook',    price: 149, points: 35,  category: 'Stationery' },
  { id: 4, name: 'Upcycled Planter Pot',   price: 249, points: 60,  category: 'Home' },
  { id: 5, name: 'Hemp Shopping Bag',      price: 179, points: 45,  category: 'Bags' },
  { id: 6, name: 'Solar Phone Charger',    price: 899, points: 200, category: 'Electronics' },
]);

export const getMockEvents = () => ([
  { id: 1, title: 'Dwarka Sector 10 Drive',  date: '30 Mar 2026', slots: 12, points: 100 },
  { id: 2, title: 'Rohini Clean-Up Rally',   date: '05 Apr 2026', slots: 20, points: 80  },
  { id: 3, title: 'NSUT Campus Plantation',  date: '12 Apr 2026', slots: 50, points: 120 },
]);
