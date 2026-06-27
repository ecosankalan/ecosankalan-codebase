<div align="center">

# 🌿 EcoSankalan

### AI-Powered Hyperlocal Waste Management Platform

Transforming sustainable waste management through **Artificial Intelligence**, **Geospatial Intelligence**, **Gamification**, and **Community Engagement**.

<p align="center">

<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>

<img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white"/>

<img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>

<img src="https://img.shields.io/badge/OpenAI-GPT--4o-purple?style=for-the-badge"/>

<img src="https://img.shields.io/badge/PWA-Installable-blueviolet?style=for-the-badge"/>

<img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge"/>

</p>

<p align="center">

<a href="https://eco-sankalan.vercel.app">
<img src="https://img.shields.io/badge/🌍_Live_Demo-Visit-success?style=flat-square">
</a>

<a href="https://ecosankalan-codebase.vercel.app">
<img src="https://img.shields.io/badge/API-Online-success?style=flat-square">
</a>

</p>

---

### 🌎 Scan • Segregate • Sustain • Earn

An intelligent **Progressive Web Application (PWA)** that enables users to classify waste using AI, locate nearby recycling bins, track environmental impact, participate in community initiatives, and earn rewards for sustainable actions.

⭐ If you like this project, consider giving it a star!

</div>

---

# 📑 Table of Contents

- Overview
- Problem Statement
- Features
- Screenshots
- Tech Stack
- Architecture
- Project Structure
- Installation
- Environment Variables
- API Overview
- AI Workflow
- Database
- Security
- Performance
- Progressive Web App
- Roadmap
- Team
- Contributing
- License

---

# 🌍 Overview

EcoSankalan is a full-stack AI-powered waste management platform developed under **NSUT Delhi – CPVS STP 2025–26(E)**.

The application encourages responsible waste disposal through artificial intelligence, geospatial search, gamification, and real-time analytics. Instead of simply logging waste, EcoSankalan creates an engaging ecosystem where users are rewarded for making environmentally responsible decisions.

The platform is fully responsive, installable as a Progressive Web Application (PWA), and designed with scalability, security, and performance in mind.

---

# ❓ Problem Statement

Despite increasing awareness of sustainability, waste segregation remains a major challenge due to:

- Limited knowledge of proper waste classification
- Difficulty locating nearby recycling bins
- Lack of incentives for responsible disposal
- Minimal participation in community sustainability programs
- No measurable way to track environmental impact

These challenges lead to recyclable waste ending up in landfills, reducing recycling efficiency and increasing environmental pollution.

---

# 💡 Our Solution

EcoSankalan addresses these issues by combining modern web technologies with Artificial Intelligence.

Users can:

- 🤖 Scan waste using AI
- 📍 Find nearby recycling bins
- ♻️ Maintain a waste disposal history
- 🏆 Earn EcoPoints
- 📊 Track carbon savings
- 📅 Participate in cleanup events
- 🛍 Redeem rewards
- 📈 Monitor sustainability progress

By transforming recycling into an engaging digital experience, EcoSankalan encourages long-term sustainable habits.

---

# ✨ Key Features

## 🤖 AI Waste Scanner

Upload or capture an image to instantly classify waste using GPT-4o Vision.

**Features**

- Waste Classification
- Material Detection
- Confidence Score
- Recycling Suggestions
- Disposal Guidance

---

## 📍 Smart Bin Locator

Locate nearby recycling bins using real-time geospatial search.

**Highlights**

- GPS Enabled
- MongoDB 2dsphere Index
- Distance-based Sorting
- Navigation Support

---

## ♻️ Waste Logging

Maintain a personal recycling journal.

Track

- Waste Type
- Quantity
- Disposal Date
- EcoPoints
- Carbon Reduction

---

## 🏆 Gamification

Encourage consistent recycling through

- EcoPoints
- Badges
- Weekly Challenges
- Leaderboards
- Achievement System

---

## 🛍 Eco Reward Shop

Redeem EcoPoints for

- Coupons
- Partner Discounts
- Gift Cards
- Promotional Offers

---

## 📅 Community Events

Connect with local communities through

- Cleanup Drives
- NGO Events
- Volunteer Programs
- Awareness Campaigns

---

## 📊 Analytics Dashboard

Visualize your sustainability journey with

- Recycling Statistics
- Carbon Saved
- Weekly Progress
- Monthly Trends
- EcoPoints History

---

## 👨‍💼 Admin Dashboard

Administrative capabilities include

- User Management
- Voucher Management
- Event Moderation
- Platform Analytics
- Waste Statistics

---

# 📸 Screenshots

> Replace these placeholders with screenshots after deployment.

| Landing Page | Dashboard |
|--------------|-----------|
| ![](images/landing.png) | ![](images/dashboard.png) |

| AI Scanner | Bin Locator |
|------------|-------------|
| ![](images/scanner.png) | ![](images/bin.png) |

| Rewards | Admin Dashboard |
|----------|-----------------|
| ![](images/rewards.png) | ![](images/admin.png) |

---

# 🚀 Tech Stack

| Category | Technologies |
|-----------|--------------|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, Google OAuth |
| AI | OpenAI GPT-4o Vision |
| Security | Helmet, bcrypt, CORS |
| Deployment | Vercel |
| Version Control | Git & GitHub |

---

# 📊 Project Statistics

| Metric | Value |
|---------|------|
| React Components | 30+ |
| Pages | 20+ |
| REST APIs | 15+ |
| Database Collections | 10+ |
| Authentication Methods | 2 |
| AI Integration | GPT-4o Vision |
| Responsive Design | ✅ |
| Progressive Web App | ✅ |

---

# 🏗️ System Architecture

```text
                ┌──────────────────────┐
                │      End User        │
                └──────────┬───────────┘
                           │
                           ▼
             React Progressive Web App
                           │
                JWT Authentication
                           │
                           ▼
                Express REST API Server
           ┌────────────┼─────────────┐
           │            │             │
           ▼            ▼             ▼
   MongoDB Atlas   OpenAI GPT-4o   Google OAuth
           │
           ▼
    GeoSpatial Queries
```

---

# 🎯 Design Principles

- Mobile-First Development
- AI-Assisted Decision Making
- Modular Architecture
- Secure by Default
- Performance Optimized
- Scalable Backend
- Responsive User Interface
- Accessibility Focused
- Sustainable Computing

---

# 📁 Project Structure

The project follows a modular architecture with separate frontend and backend applications to ensure maintainability and scalability.

```text
ecosankalan/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── .env.example
├── package.json
├── vercel.json
└── README.md
```

---

# ⚙️ Getting Started

## Prerequisites

Before running the project, ensure you have:

- Node.js (v18+)
- npm
- Git
- MongoDB Atlas Account
- OpenAI API Key
- Google OAuth Client

---

## Clone Repository

```bash
git clone https://github.com/<username>/ecosankalan.git

cd ecosankalan
```

---

## Install Backend

```bash
npm install
```

---

## Install Frontend

```bash
cd frontend

npm install

cd ..
```

---

# 🔐 Environment Variables

### Backend (.env)

```env
PORT=5000

NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

OPENAI_API_KEY=your_openai_api_key

GOOGLE_CLIENT_ID=your_google_client_id

CLIENT_URL=http://localhost:5173
```

---

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:5000

VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

# ▶ Running the Project

## Backend

```bash
npm run dev
```

Runs on

```
http://localhost:5000
```

---

## Frontend

```bash
cd frontend

npm run dev
```

Runs on

```
http://localhost:5173
```

---

# 🚀 Deployment

The project is deployed using **Vercel** and **MongoDB Atlas**.

| Service | Purpose |
|----------|----------|
| Vercel | Frontend Hosting |
| Vercel | Backend Hosting |
| MongoDB Atlas | Cloud Database |
| GitHub | Version Control |

Deployment is fully automated through GitHub integration with Vercel.

---

# 📡 API Overview

The backend exposes RESTful APIs secured using JWT Authentication.

| Module | Description |
|----------|-------------|
| Authentication | Registration, Login, Google OAuth |
| Users | User Profile & Statistics |
| Waste | Waste Logging & History |
| AI | AI Waste Classification |
| Bin Locator | Nearby Recycling Bins |
| Challenges | Weekly Challenges |
| Events | Community Cleanup Drives |
| Rewards | Eco Shop & Voucher Redemption |
| Leaderboard | User Rankings |
| Admin | Platform Management |

---

# 🔐 Authentication Flow

```text
          User
            │
            ▼
     Login / Google OAuth
            │
            ▼
     Credential Validation
            │
            ▼
        JWT Generated
            │
            ▼
     Protected API Access
```

---

# 🤖 AI Waste Classification Workflow

```text
Upload Image

      │

      ▼

Image Validation

      │

      ▼

GPT-4o Vision Analysis

      │

      ▼

Waste Classification

      │

      ▼

Material Detection

      │

      ▼

Confidence Score

      │

      ▼

Disposal Recommendation
```

---

# 📍 Smart Bin Locator

Nearby recycling bins are identified using MongoDB's geospatial indexing.

```text
User Location

      │

      ▼

Latitude & Longitude

      │

      ▼

MongoDB 2dsphere Index

      │

      ▼

$near Query

      │

      ▼

Sorted Nearby Bins
```

---

# 🗄 Database Design

EcoSankalan uses MongoDB Atlas with Mongoose ODM.

### Collections

- Users
- WasteLogs
- Bins
- Events
- Challenges
- ChallengeProgress
- Products
- Vouchers
- Orders

---

## Entity Relationship

```text
User
 │
 ├──────────────┐
 │              │
 ▼              ▼

WasteLogs    Challenges

 │              │

 ▼              ▼

EcoPoints   Badges

      │

      ▼

Voucher Redemption

      │

      ▼

Partner Products
```

---

# 🔒 Security

Security has been implemented at multiple layers.

- JWT Authentication
- Google OAuth Verification
- Password Hashing using bcrypt
- Helmet Security Headers
- CORS Protection
- API Rate Limiting
- Secure Environment Variables
- Input Validation
- Role-Based Access Control
- Protected API Routes

---

# ⚡ Performance Optimizations

To ensure a smooth user experience, several optimizations have been implemented.

- MongoDB 2dsphere Geospatial Indexing
- Cached Dashboard Statistics
- Optimized Database Queries
- Response Compression
- Lazy Loading Components
- Efficient API Design
- Atomic Voucher Redemption
- Optimized Image Upload Flow

---

# 📱 Progressive Web App

EcoSankalan is built as a Progressive Web Application.

### Features

- Installable on Android & iOS
- Responsive Design
- Offline Support
- Home Screen Installation
- Fast Loading
- Native App-like Experience

### Installation

**Android**

Chrome → Menu → Add to Home Screen

**iOS**

Safari → Share → Add to Home Screen

---

# 📊 Project Highlights

| Metric | Value |
|---------|------|
| React Components | 30+ |
| Pages | 20+ |
| REST APIs | 15+ |
| MongoDB Collections | 9+ |
| Authentication Methods | 2 |
| AI Integration | GPT-4o Vision |
| Progressive Web App | ✅ |
| Mobile Responsive | ✅ |

---

# 🌱 Sustainability Impact

EcoSankalan encourages environmentally responsible behavior through technology.

Users can:

- Measure Carbon Reduction
- Track Recycling History
- Participate in Community Events
- Earn EcoPoints
- Redeem Sustainable Rewards

The platform aims to bridge the gap between technology and environmental responsibility by making sustainable actions engaging and rewarding.

---

# 🗺️ Roadmap

EcoSankalan is continuously evolving. The following features are planned for future releases.

### Short Term

- Push Notifications
- AI Disposal Recommendations
- Better Reward Marketplace
- QR Code-based Waste Logging
- Community Event Calendar

### Long Term

- Native Android & iOS Applications
- Smart Bin IoT Integration
- AI Voice Assistant
- NGO Management Portal
- Carbon Credit Marketplace
- Multi-language Support
- Municipal Dashboard
- Analytics using Machine Learning

---

# 🧪 Testing

The project has been tested across major browsers and devices to ensure a smooth user experience.

### Functional Testing

- ✅ User Registration
- ✅ User Login
- ✅ Google OAuth
- ✅ JWT Authentication
- ✅ Waste Logging
- ✅ AI Waste Classification
- ✅ Bin Locator
- ✅ EcoPoints System
- ✅ Rewards Redemption
- ✅ Community Events
- ✅ Admin Dashboard

---

### UI Testing

- ✅ Responsive Layout
- ✅ Mobile Friendly
- ✅ Tablet Support
- ✅ Desktop Support
- ✅ Cross Browser Compatibility

---

### Performance Testing

- ✅ Optimized API Responses
- ✅ Lazy Loading
- ✅ Efficient MongoDB Queries
- ✅ Compressed Assets
- ✅ Fast Initial Load

---

# 🤝 Contributing

Contributions are always welcome!

If you would like to contribute to EcoSankalan:

1. Fork the repository.

2. Create a feature branch.

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes.

```bash
git commit -m "Add amazing feature"
```

4. Push to your branch.

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request.

Please ensure your code follows the project's coding standards and includes meaningful commit messages.

---

# 💻 Local Development Guidelines

Before creating a Pull Request:

- Follow consistent coding conventions.
- Write reusable components.
- Keep commits small and descriptive.
- Test your changes locally.
- Never commit API keys or secrets.

---

# 📄 License

This project is distributed under the **MIT License**.

You are free to use, modify, and distribute this software under the terms of the MIT License.

See the `LICENSE` file for more details.

---

# 🙏 Acknowledgements

This project would not have been possible without the amazing open-source ecosystem.

Special thanks to:

- OpenAI
- React
- Node.js
- Express.js
- MongoDB Atlas
- Vercel
- Google OAuth
- Vite
- GitHub

We also acknowledge the guidance and support provided by **Netaji Subhas University of Technology (NSUT)** under the **CPVS-STP 2025–26(E)** program.

---

# 👨‍💻 Team

<table>
<tr>
<td align="center">
<img src="https://avatars.githubusercontent.com/u/1?v=4" width="80px"/><br>
<b>Vipin Gupta</b><br>
Full Stack Developer
</td>

<td align="center">
<img src="https://avatars.githubusercontent.com/u/2?v=4" width="80px"/><br>
<b>Krishna</b><br>
Frontend Lead
</td>

<td align="center">
<img src="https://avatars.githubusercontent.com/u/3?v=4" width="80px"/><br>
<b>Atishay Jain</b><br>
Full Stack Developer
</td>

<td align="center">
<img src="https://avatars.githubusercontent.com/u/4?v=4" width="80px"/><br>
<b>Bhagya Ranjan Singh</b><br>
Frontend & Research
</td>

<td align="center">
<img src="https://avatars.githubusercontent.com/u/5?v=4" width="80px"/><br>
<b>Ayush Jha</b><br>
Full Stack Developer
</td>
</tr>
</table>

> Replace the placeholder avatar URLs with your GitHub profile images.

---

# 📬 Contact

For suggestions, collaborations, or feedback:

📧 **Email:** your-email@example.com

🌐 **Project:** https://eco-sankalan.vercel.app

📂 **Repository:** https://github.com/yourusername/ecosankalan

---

# ⭐ Show Your Support

If you found this project helpful,

⭐ Star the repository

🍴 Fork it

🛠️ Contribute

📢 Share it with others

Every contribution helps us build a more sustainable future.

---

# 🌱 Why EcoSankalan?

> **"Small actions create a greener tomorrow."**

EcoSankalan demonstrates how modern technologies such as **Artificial Intelligence**, **Geospatial Computing**, **Cloud Infrastructure**, and **Progressive Web Applications** can be combined to solve real-world environmental challenges.

The project is more than a waste management application—it's an initiative to encourage sustainable habits, empower communities, and leverage technology for social impact.

---

<div align="center">

## 🌿 EcoSankalan

### AI-Powered Hyperlocal Waste Management Platform

Built with ❤️ using **React • Node.js • MongoDB • OpenAI • Vercel**

**Made at Netaji Subhas University of Technology (NSUT)**

### ♻️ Reduce • Recycle • Reward • Repeat

⭐ **If you like this project, please give it a Star!**

</div>
