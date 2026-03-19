# 🌿 EcoSankalan

> Hyperlocal waste management & recycling platform — NSUT CPVS-STP 2025-26(E)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)
![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-green)
![Status](https://img.shields.io/badge/Status-Month%201%20--%20Foundation-blue)

---

## 📋 Project Overview

EcoSankalan is a community-driven mobile + web app that lets urban residents:
- **Log** household waste (manual or AI-powered photo scan via Gemini Vision)
- **Earn** eco-points for waste logging and community event participation
- **Find** nearby recycling bins and community drives on a live map
- **Redeem** eco-points in the Eco-Shop (10 pts = ₹1, max 30% discount)

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
| Frontend | React.js + Tailwind CSS |
| Mobile | Median.co (Android APK wrapper) |
| Backend | Node.js + Express.js (MVC) |
| Database | MongoDB Atlas (Mongoose ODM) |
| AI | Google Gemini 1.5 Flash (Vision) |
| Maps | OpenStreetMap + Leaflet.js |
| Auth | JWT + bcrypt + OTP (MSG91) |
| Payments | Razorpay |
| Push Notifs | Firebase FCM |
| Hosting | Vercel |

---

## 🚀 Getting Started (Backend)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free M0 tier)
- Git

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/ecosankalan/ecosankalan-codebase.git
cd ecosankalan-codebase

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your MongoDB URI and JWT secret

# 4. Start development server
npm run dev

# 5. Verify it's working
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

---

## 📁 Project Structure

```
ecosankalan-codebase/
├── src/
│   ├── app.js              # Express app (middleware + routes)
│   ├── server.js           # HTTP server entry point
│   ├── config/
│   │   ├── database.js     # MongoDB Atlas connection
│   │   └── logger.js       # Winston structured logger
│   ├── middleware/
│   │   ├── auth.js         # JWT protect + authorize middleware
│   │   ├── errorHandler.js # Global error + 404 handler
│   │   └── validate.js     # express-validator result checker
│   ├── routes/
│   │   ├── health.js       # GET /health
│   │   ├── auth.js         # /api/v1/auth/* (Month 2)
│   │   ├── users.js        # /api/v1/users/* (Month 2)
│   │   ├── waste.js        # /api/v1/waste/* (Month 3)
│   │   ├── bins.js         # /api/v1/bins/* (Month 4)
│   │   ├── events.js       # /api/v1/events/* (Month 4)
│   │   ├── products.js     # /api/v1/products/* (Month 5)
│   │   └── orders.js       # /api/v1/orders/* (Month 5)
│   ├── controllers/        # Business logic (Month 2+)
│   ├── models/             # Mongoose schemas (Atishay — Month 1)
│   └── utils/              # Shared helpers
├── tests/                  # Jest + Supertest (Month 2)
├── .env.example            # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

---

## 🗺️ API Surface Area

| Method | Route | Status | Month |
|--------|-------|--------|-------|
| GET | `/health` | ✅ Live | 1 |
| POST | `/api/v1/auth/register` | 🔧 Stub | 2 |
| POST | `/api/v1/auth/verify-otp` | 🔧 Stub | 2 |
| POST | `/api/v1/auth/login` | 🔧 Stub | 2 |
| GET | `/api/v1/users/profile` | 🔧 Stub | 2 |
| POST | `/api/v1/waste/log` | 🔧 Stub | 3 |
| GET | `/api/v1/waste/stats` | 🔧 Stub | 3 |
| GET | `/api/v1/bins?lat&lng&radius` | 🔧 Stub | 4 |
| POST | `/api/v1/events/:id/rsvp` | 🔧 Stub | 4 |
| POST | `/api/v1/orders/checkout` | 🔧 Stub | 5 |

Full API documentation: [Postman Collection](docs/postman/) _(coming Month 2)_

---

## 📅 Roadmap

| Month | Theme | Key Deliverable |
|-------|-------|-----------------|
| 1 | Foundation | Schema, skeleton, SRS ← **NOW** |
| 2 | Auth | JWT login, OTP, quiz module |
| 3 | Waste + AI | Gemini scan, eco-points, dashboard |
| 4 | Map + Events | Geospatial bins, FCM notifications |
| 5 | Eco-Shop | Razorpay, eco-points redemption |
| 6 | Deploy | Android APK, Vercel prod, final report |

**Intermediate Report Deadline:** 26 March 2026  
**Final Report Deadline:** Before end-semester exams (Month 6)

---

## 🔐 Compliance

- **DPDP Act 2023** — Only necessary user data stored; JWT contains userId + role only (no PII)
- **GFR Rule 154** — All purchases follow government financial rules; GST bills submitted to faculty guide
- **MongoDB Atlas** — Data encrypted in transit (TLS) and at rest (M10+)

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting PRs.

Branch strategy:
- `main` — production-ready code only
- `dev` — integration branch; all PRs merge here first
- `feature/your-feature-name` — your working branch

---

## 📄 License

MIT © 2026 EcoSankalan Team, NSUT Delhi
