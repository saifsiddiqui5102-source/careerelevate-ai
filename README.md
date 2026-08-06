# 🚀 CareerElevate AI - Resume Analyzer & AI Interview Preparation Platform

![Version](https://img.shields.io/badge/version-1.0.0-indigo.svg)
![Stack](https://img.shields.io/badge/stack-MERN--Stack-blue.svg)
![Security](https://img.shields.io/badge/security-Hardened-emerald.svg)
![API Docs](https://img.shields.io/badge/Swagger-OpenAPI%203.0-amber.svg)

**CareerElevate AI** is an enterprise-grade MERN stack platform designed to optimize candidate ATS resume compliance, generate personalized 11-pillar career advice, and provide interactive AI interview coaching with STAR model scoring.

---

## 🌟 Architecture Overview

```
                      +----------------------------------+
                      |    React + Vite Client (3000)    |
                      +----------------------------------+
                                       |
                                       v
                      +----------------------------------+
                      |     Express.js API Server (v1)   |
                      |   [Helmet, Rate Limit, MongoSan] |
                      +----------------------------------+
                               /       |        \
                              /        |         \
                             v         v          v
              +----------------+  +----------+  +-------------------+
              | MongoDB Atlas  |  | Gemini AI|  | Winston Logger    |
              | (Or Memory DB) |  |   API    |  | error & combined  |
              +----------------+  +----------+  +-------------------+
```

---

## 📘 Interactive API Documentation (Swagger UI)

Interactive OpenAPI 3.0 documentation is mounted directly on the backend server:

- **Local Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Production Swagger UI**: `https://your-render-app.onrender.com/api-docs`

---

## 📡 REST API v1 Versioned Endpoints

### 🔐 1. Authentication & Candidate Access (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | Create candidate account & generate 6-digit OTP | ❌ |
| `POST` | `/api/v1/auth/verify-otp` | Verify OTP code & issue JWT token | ❌ |
| `POST` | `/api/v1/auth/resend-otp` | Generate fresh OTP code | ❌ |
| `POST` | `/api/v1/auth/login` | Candidate login with bcrypt verification | ❌ |
| `POST` | `/api/v1/auth/logout` | Revoke session | ❌ |
| `GET`  | `/api/v1/auth/profile` | Fetch authenticated user profile | ✅ |
| `POST` | `/api/v1/auth/forgot-password` | Send 15-minute crypto password reset link | ❌ |
| `POST` | `/api/v1/auth/reset-password` | Set new account password via token | ❌ |

### 👤 2. Candidate User Profile (`/api/v1/user`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET`  | `/api/v1/user/profile` | Get candidate profile, skills, experience & education | ✅ |
| `PUT`  | `/api/v1/user/profile` | Update candidate details, avatar & skill tags | ✅ |

### 📄 3. Resume Versioning & ATS Analysis (`/api/v1/resume`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/resume/upload` | Upload PDF resume & auto-increment version number (`v1.0`, `v2.0`) | ✅ |
| `POST` | `/api/v1/resume/analyze` | Execute 11-pillar Gemini AI ATS audit scan | ✅ |
| `GET`  | `/api/v1/resume/history` | Fetch candidate resume analysis history | ✅ |
| `GET`  | `/api/v1/resume/versions` | Fetch all saved resume versions | ✅ |
| `POST` | `/api/v1/resume/compare` | Compare 2 resume versions and calculate `%` ATS boost | ✅ |
| `GET`  | `/api/v1/resume/:id` | Fetch specific resume record details | ✅ |

### 🎤 4. AI Interview Prep Simulator (`/api/v1/interview`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET`  | `/api/v1/interview/questions` | Get question bank filtered by role & difficulty | ✅ |
| `POST` | `/api/v1/interview/generate-questions` | Dynamically generate HR, Technical, Coding & STAR questions | ✅ |
| `POST` | `/api/v1/interview/mock` | Evaluate candidate practice answer with STAR feedback | ✅ |
| `GET`  | `/api/v1/interview/history` | Get stored interview session timeline | ✅ |

### 📊 5. SaaS Dashboard Analytics (`/api/v1/dashboard`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET`  | `/api/v1/dashboard` | Aggregated SaaS summary cards, Recharts data & progress gauges | ✅ |
| `GET`  | `/api/v1/dashboard/analytics` | Fetch analytics scorecard metrics | ✅ |
| `GET`  | `/api/v1/dashboard/activity` | Fetch recent candidate activity feed | ✅ |
| `GET`  | `/api/v1/dashboard/charts` | Fetch 5 Recharts dataset distributions | ✅ |
| `GET`  | `/api/v1/dashboard/progress` | Fetch 5 circular SVG competency progress indicators | ✅ |

---

## 🔒 Production Security Hardening

1. **Helmet HTTP Headers**: Enforces CSP, HSTS, X-Frame-Options, X-Content-Type-Options.
2. **Express Rate Limiter**: 100 requests per 15 minutes globally; 20 requests per 15 minutes on auth endpoints.
3. **NoSQL Query Injection Block**: `express-mongo-sanitize` strips `$` and `.` operators.
4. **XSS Input Sanitization**: `xss-clean` escapes dangerous script tags in request bodies.
5. **Strict Whitelisted CORS**: Configured to restrict origin requests to trusted frontend domains.
6. **Centralized Error Handler**: Formats CastErrors, Duplicate 11000 Keys, ValidationErrors, and JWT failures without exposing internal stack traces in production.

---

## 📝 Logging System (Winston + Morgan)

All backend events and errors are recorded in standard log files inside `server/logs/`:

- `server/logs/error.log`: Captures system errors, failed requests, database connection issues, unhandled exceptions, and rejected promises.
- `server/logs/combined.log`: Captures all HTTP request logs and domain events (User Registration, Login, Resume Upload, Resume Analysis, Gemini AI API Calls).

Each log entry includes: `[Timestamp] [Level] HTTP Method Route Status Code | Error Stack`.

---

## 🧪 Automated Testing

Automated test suites validate authentication, ATS analysis, version comparison, dynamic interview questions, and dashboard metrics.

```bash
cd server
npm test
```

---

## 💻 Local Development Setup

### 1. Clone Repository & Install Dependencies
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 2. Configure Environment Variables
Create `.env` inside `server/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/careerelevate
JWT_SECRET=careerelevate_super_secret_jwt_key_2026_pro
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Launch Development Servers
```bash
# Terminal 1: Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2: React Frontend Server (Port 3000)
npm run dev
```

Access the frontend at `http://localhost:3000` and Swagger UI at `http://localhost:5000/api-docs`.
