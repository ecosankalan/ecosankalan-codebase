# 🌿 EcoSankalan — Frontend

> Community-driven waste management web app · NSUT CPVS-STP 2025-26

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📌 Project Info

| Field | Detail |
|-------|--------|
| **Project ID** | STP2025-26(E)CSE(M)VivekAyush(2024UCS1573) |
| **Faculty Guide** | Prof. Vivek Mehta, NSUT Dept. of CSE |
| **Grant** | ₹10,000 · NSUT CPVS Short-Term Project |
| **Frontend Dev** | Vipin Gupta (2024UCS1607) |
| **UI/UX Design** | Krishna (2024UCS1548) |

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/your-org/ecosankalan-frontend.git
cd ecosankalan-frontend

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your backend URL

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Navbar.jsx          # Sticky top bar (all pages)
│   │   ├── BottomNav.jsx       # Fixed bottom nav + FAB
│   │   └── Footer.jsx          # Auth pages footer
│   ├── auth/
│   │   ├── LoginForm.jsx       # ✅ API connected (Month 2)
│   │   ├── RegisterForm.jsx    # ✅ API connected (Month 2)
│   │   └── OTPForm.jsx         # ✅ API connected (Month 2)
│   └── dashboard/
│       └── StatCard.jsx        # 📊 Reusable metric card
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── OTPPage.jsx
│   ├── DashboardPage.jsx       # 📊 Static mock data
│   ├── WasteLogPage.jsx        # 🔘 Log button works
│   ├── ImpactPage.jsx          # 📊 Static mock data
│   ├── ShopPage.jsx            # 🔘 Add to cart works
│   ├── CommunityPage.jsx       # 📊 Static mock data
│   └── ProfilePage.jsx         # 📊 Static mock data
├── services/
│   └── api.js                  # All API calls + mock data
├── context/
│   └── AuthContext.jsx         # Global login state
├── hooks/                      # Custom hooks (Month 3+)
├── assets/                     # Images, icons, SVGs
└── styles/
    ├── global.css              # Design tokens + shared styles
    ├── login.css               # Auth pages
    ├── otp.css                 # OTP page
    ├── navbar.css
    ├── bottomnav.css
    ├── dashboard.css
    ├── waste.css
    ├── impact.css
    ├── shop.css
    ├── community.css
    └── profile.css
```

---

## 🗺️ Routes

| Route | Page | Auth Required |
|-------|------|---------------|
| `/login` | Login | No |
| `/register` | Register | No |
| `/otp` | OTP Verification | No |
| `/dashboard` | Home Dashboard | ✅ Yes |
| `/waste` | Waste Log | ✅ Yes |
| `/impact` | Impact Tracking | ✅ Yes |
| `/shop` | Eco-Shop | ✅ Yes |
| `/community` | Community Map | ✅ Yes |
| `/profile` | User Profile | ✅ Yes |

---

## 📅 Development Timeline

| Month | Frontend Tasks | Status |
|-------|---------------|--------|
| **1** | Project setup, all pages UI, common components | ✅ Done |
| **2** | Wire Login/Register/OTP to real API | 🔜 Next |
| **3** | Waste log API, dashboard live data | 🔜 |
| **4** | Community map (live bins + events) | 🔜 |
| **5** | Eco-Shop checkout, Eco-Points live | 🔜 |

---

## 🔌 API Integration Status

| Endpoint | Status | Month |
|----------|--------|-------|
| `GET /health` | ✅ Live | 1 |
| `POST /api/v1/auth/register` | 🔧 Mock | 2 |
| `POST /api/v1/auth/verify-otp` | 🔧 Mock | 2 |
| `POST /api/v1/auth/login` | 🔧 Mock | 2 |
| `GET /api/v1/users/profile` | 🔧 Mock | 2 |
| `POST /api/v1/waste/log` | 🔧 Mock | 3 |
| `GET /api/v1/waste/stats` | 🔧 Mock | 3 |
| `GET /api/v1/bins` | 🔧 Mock | 4 |
| `POST /api/v1/events/:id/rsvp` | 🔧 Mock | 4 |
| `POST /api/v1/orders/checkout` | 🔧 Mock | 5 |

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite 5
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Fonts**: Plus Jakarta Sans (headlines) + Inter (body)
- **Icons**: Google Material Symbols
- **Styling**: Plain CSS with CSS variables (no Tailwind)
- **Deployment**: Vercel (planned)

---

## 👥 Team

| Member | Roll No | Role |
|--------|---------|------|
| Ayush Kumar Jha | 2024UCS1573 | Team Lead, Backend APIs, DB Schema |
| Bhagya Rajan Singh | 2024UCS2135 | Research, surveys, content |
| Krishna | 2024UCS1548 | UI/UX design, Figma prototypes |
| **Vipin Gupta** | **2024UCS1607** | **Frontend React development** |
| Atishay Jain | 2024UCS1510 | Backend infra, MongoDB Atlas, deployment |
