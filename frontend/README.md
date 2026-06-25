# 🌿 EcoSankalan

> Hyperlocal waste management & sustainability tracking platform — NSUT CPVS-STP 2025-26(E)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%20+%20Vite-61dafb)
![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-green)
![Status](https://img.shields.io/badge/Status-Month%205%20Complete-brightgreen)

---

## 📋 Project Overview

EcoSankalan is a community-driven mobile-first web app that empowers urban residents to build sustainable habits through gamification, AI-powered tools, and community engagement.

**Core capabilities:**
- 📷 **AI Waste Scan** — point your camera at any item; Gemini Vision classifies it instantly and shows category-specific disposal tips
- ✍️ **Manual Waste Logging** — log waste by category with real CO₂ conversion factors and live eco-points preview
- 📊 **Impact Analytics** — personal eco-score, CO₂ saved, weekly bar charts, goal tracking, and badge achievements
- 🏆 **Challenges & Quizzes** — weekly challenges with progress tracking, 4 quiz modules (5 questions each) with badge unlocking
- 🛍️ **Eco-Shop** — redeem eco-points for sustainable products from partner brands; voucher management
- 🌱 **Learn Hub** — upcycling tutorials (category-filtered), disposal guides, and educational videos
- 🗺️ **Community** — local events, RSVPs, and community map

**CPVS Project ID:** `STP2025-26(E)CSE(M)VivekAyush(2024UCS1573)`
**Faculty Guide:** Prof. Vivek Mehta
**Grant:** ₹10,000 | **Scheme:** NSUT CPVS Short-Term Project

---

## 👥 Team

| Member | Roll No | Role |
|--------|---------|------|
| Ayush Kumar Jha | 2024UCS1573 | Team Lead, Backend APIs, DB Schema, SRS |
| Bhagya Rajan Singh | 2024UCS2135 | Research, surveys, content, thesis |
| Krishna | 2024UCS1548 | UI/UX design, Figma prototypes |
| Vipin Gupta | 2024UCS1607 | Frontend React development |
| Atishay Jain | 2024UCS1510 | Backend infra, MongoDB Atlas, deployment |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Router DOM |
| Styling | Plain CSS with CSS custom properties (no Tailwind) |
| Icons | Material Symbols Outlined (Google Fonts) |
| Typography | Plus Jakarta Sans (headlines) + Inter (body) |
| Mobile | Median.co (Android APK wrapper) |
| Backend | Node.js + Express.js (MVC) |
| Database | MongoDB Atlas (Mongoose ODM) |
| AI | Google Gemini Vision (waste classification) |
| Auth | JWT + bcrypt + OTP |
| Storage | Cloudinary (image uploads) |
| Hosting | Vercel |

---

## 🚀 Getting Started

### Backend

```bash
# 1. Clone the repo
git clone https://github.com/ecosankalan/ecosankalan-codebase.git
cd ecosankalan-codebase

# 2. Install backend dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env — fill in MongoDB URI, JWT secret, Gemini API key, Cloudinary keys

# 4. Start the backend dev server
npm run dev

# 5. Verify it's running
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "project": "EcoSankalan",
  "server": "running",
  "database": "connected"
}
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

> The frontend reads `VITE_API_URL` from `frontend/.env` to point at the backend.
> Default: `http://localhost:5000`

---

## 📁 Project Structure

```
ecosankalan-codebase/
├── src/                          # Backend (Node.js + Express)
│   ├── app.js                    # Express app — middleware + routes
│   ├── server.js                 # HTTP server entry point
│   ├── config/
│   │   ├── database.js           # MongoDB Atlas connection
│   │   ├── logger.js             # Winston structured logger
│   │   ├── aiConfig.js           # Gemini AI configuration
│   │   ├── aiPrompts.js          # AI classification prompts
│   │   ├── aiSchema.js           # AI response schema
│   │   ├── openaiClient.js       # AI client initialisation
│   │   └── cloudinary.js         # Cloudinary image upload config
│   ├── middleware/
│   │   ├── auth.js               # JWT protect + authorize
│   │   ├── errorHandler.js       # Global error + 404 handler
│   │   ├── validate.js           # express-validator result checker
│   │   ├── upload.js             # Multer — waste image uploads
│   │   └── avatarUpload.js       # Multer — profile avatar uploads
│   ├── controllers/
│   │   ├── aiScanController.js   # POST /ai/analyze — Gemini Vision
│   │   └── userController.js     # User profile operations
│   ├── models/
│   │   ├── User.js               # User schema (auth, points, badges)
│   │   ├── WasteLog.js           # Waste log entries + CO₂ data
│   │   ├── Bin.js                # Recycling bin locations (geospatial)
│   │   ├── Challenge.js          # Challenge definitions
│   │   ├── ChallengeProgress.js  # Per-user challenge tracking
│   │   ├── Event.js              # Community events
│   │   ├── Product.js            # Eco-shop products
│   │   ├── PartnerProduct.js     # Partner brand products
│   │   ├── Order.js              # Eco-points redemption orders
│   │   └── Voucher.js            # User vouchers
│   ├── routes/
│   │   ├── health.js             # GET /health
│   │   ├── auth.js               # /api/v1/auth/*
│   │   ├── users.js              # /api/v1/users/*
│   │   ├── waste.js              # /api/v1/waste/*
│   │   ├── ai.js                 # /api/v1/ai/analyze
│   │   ├── bins.js               # /api/v1/bins/*
│   │   ├── challenges.js         # /api/v1/challenges/*
│   │   ├── events.js             # /api/v1/events/*
│   │   ├── products.js           # /api/v1/products/*
│   │   ├── orders.js             # /api/v1/orders/*
│   │   ├── vouchers.js           # /api/v1/vouchers/*
│   │   └── admin.js              # /api/v1/admin/*
│   ├── services/
│   │   └── rewardEngine.js       # Eco-points + badge calculation
│   └── utils/
│       ├── apiResponse.js        # Standardised JSON responses
│       ├── asyncHandler.js       # Async error wrapper
│       └── buildAiInput.js       # Formats images for Gemini
├── tests/                        # Jest + Supertest
│   ├── health.test.js
│   ├── models.test.js
│   ├── bins.test.js
│   ├── challenges.test.js
│   ├── events.test.js
│   ├── products.test.js
│   ├── vouchers.test.js
│   ├── admin.test.js
│   ├── rewardEngine.test.js
│   └── wasteStats.test.js
├── frontend/                     # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx               # All routes defined here
│       ├── main.jsx
│       ├── context/
│       │   └── AuthContext.jsx   # JWT auth state (login/logout)
│       ├── hooks/
│       │   └── useLocalStorage.js
│       ├── services/
│       │   └── api.js            # Axios instance + all API calls
│       ├── components/
│       │   ├── common/
│       │   │   ├── Navbar.jsx
│       │   │   ├── BottomNav.jsx # Fixed bottom nav (5 tabs)
│       │   │   └── Footer.jsx
│       │   ├── auth/
│       │   │   ├── LoginForm.jsx
│       │   │   ├── RegisterForm.jsx
│       │   │   └── OTPForm.jsx
│       │   └── dashboard/
│       │       ├── DashboardSkeleton.jsx
│       │       └── StatCard.jsx
│       ├── pages/                # One file per route
│       │   ├── LoginPage.jsx / RegisterPage.jsx / OTPPage.jsx
│       │   ├── ForgotPasswordPage.jsx / VerifyPhonePage.jsx / ResetPasswordPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── WasteLogPage.jsx
│       │   ├── ScanResultPage.jsx
│       │   ├── WasteHistoryPage.jsx
│       │   ├── ImpactPage.jsx
│       │   ├── LearnPage.jsx
│       │   ├── QuizPage.jsx / QuizResultPage.jsx
│       │   ├── ChallengeProgressPage.jsx
│       │   ├── WeeklyChallengesPage.jsx
│       │   ├── EventDetailPage.jsx
│       │   ├── CommunityPage.jsx
│       │   ├── ShopPage.jsx
│       │   ├── ProductDetailPage.jsx
│       │   ├── VouchersPage.jsx
│       │   └── ProfilePage.jsx
│       └── styles/               # One CSS file per page + globals
├── vercel.json
├── package.json
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

---

## 🗺️ API Reference

| Method | Route | Description | Status |
|--------|-------|-------------|--------|
| GET | `/health` | Server + DB health check | ✅ Live |
| POST | `/api/v1/auth/register` | Register new user | ✅ Live |
| POST | `/api/v1/auth/verify-otp` | Verify email OTP | ✅ Live |
| POST | `/api/v1/auth/login` | Login, returns JWT | ✅ Live |
| GET | `/api/v1/users/profile` | Get authenticated user profile | ✅ Live |
| POST | `/api/v1/ai/analyze` | Upload image → Gemini classification + disposal tips | ✅ Live |
| POST | `/api/v1/waste/log` | Log waste entry, calc CO₂ + points | ✅ Live |
| GET | `/api/v1/waste/stats` | User waste stats + history | ✅ Live |
| GET | `/api/v1/bins` | Nearby recycling bins `?lat&lng&radius` | ✅ Live |
| GET | `/api/v1/challenges` | List all challenges | ✅ Live |
| POST | `/api/v1/challenges/:id/join` | Join a challenge | ✅ Live |
| GET | `/api/v1/events` | Community events listing | ✅ Live |
| POST | `/api/v1/events/:id/rsvp` | RSVP to an event | ✅ Live |
| GET | `/api/v1/products` | Eco-shop product listing | ✅ Live |
| POST | `/api/v1/orders/checkout` | Redeem eco-points for product | ✅ Live |
| GET | `/api/v1/vouchers` | User's earned vouchers | ✅ Live |
| GET | `/api/v1/admin/*` | Admin panel routes | ✅ Live |

---

## 🖥️ Frontend Routes

| Path | Page | Auth Required |
|------|------|--------------|
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |
| `/otp` | OTPPage | No |
| `/forgot-password` | ForgotPasswordPage | No |
| `/verify-phone` | VerifyPhonePage | No |
| `/reset-password` | ResetPasswordPage | No |
| `/dashboard` | DashboardPage | Yes |
| `/waste` | WasteLogPage | Yes |
| `/scan-result` | ScanResultPage | Yes |
| `/waste-history` | WasteHistoryPage | Yes |
| `/impact` | ImpactPage (full analytics) | Yes |
| `/learn` | LearnPage (videos + upcycling) | Yes |
| `/quiz` | QuizPage (4 quizzes × 5 Qs) | Yes |
| `/quiz-result` | QuizResultPage | Yes |
| `/challenge-progress` | ChallengeProgressPage | Yes |
| `/weekly-challenges` | WeeklyChallengesPage | Yes |
| `/event-detail` | EventDetailPage | Yes |
| `/community` | CommunityPage | Yes |
| `/shop` | ShopPage | Yes |
| `/product-detail` | ProductDetailPage | Yes |
| `/vouchers` | VouchersPage | Yes |
| `/profile` | ProfilePage | Yes |

---

## 📅 Development Progress

| Month | Theme | Status | Key Deliverables |
|-------|-------|--------|-----------------|
| 1 | Foundation | ✅ Done | MongoDB schemas (10 models), Express skeleton, SRS, project scaffold |
| 2 | Auth + Frontend Base | ✅ Done | JWT login/register/OTP, React scaffold, all auth pages, BottomNav, routing |
| 3 | Waste + AI | ✅ Done | Gemini AI scan wired to backend, manual waste log with CO₂ conversion, eco-points engine, impact analytics page, scan result with disposal tips |
| 4 | Map + Events + Challenges | ✅ Done | Geospatial bin search, community events + RSVP, challenge system with progress tracking, weekly challenges page, event detail page |
| 5 | Shop + Learn + Polish | ✅ Done | Eco-shop redesign with vouchers + product detail, upcycling tutorial hub (FR-26) with category filtering, 4 quiz modules with badge system, daily check-in badge, quiz results on profile |
| 6 | Deploy + Report | 🔜 Upcoming | Android APK (Median.co), Vercel prod deploy, final thesis report |

---

---

## 🔐 Security & Compliance

- **DPDP Act 2023** — Only necessary data stored; JWT contains `userId + role` only (no PII in token)
- **GFR Rule 154** — All purchases follow government financial rules; GST bills submitted to faculty guide
- **MongoDB Atlas** — Data encrypted in transit (TLS) and at rest
- **No secrets in code** — All keys via `.env`; `.gitignore` covers `.env`

---

## 🧪 Running Tests

```bash
# From repo root
npm test

# Run a specific test file
npx jest tests/rewardEngine.test.js --verbose
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch strategy, commit message format, and PR rules.

**Rule:** No direct pushes to `dev`. Always open a Pull Request → `dev`.

---

## 📄 License

MIT © 2026 EcoSankalan Team, NSUT Delhi
