# 🔑 Environment Variable Documentation - CareerElevate AI

This document provides a dictionary of all environment variables required for **CareerElevate AI**.

---

## ⚙️ Backend Environment Variables (`server/.env`)

| Variable Name | Environment | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | All | `5000` | Port number on which Express server listens |
| `NODE_ENV` | Dev/Prod | `development` | Environment mode (`development`, `production`, `test`) |
| `MONGO_URI` | All | `mongodb://127.0.0.1:27017/careerelevate` | MongoDB connection string (Local or MongoDB Atlas Cluster) |
| `JWT_SECRET` | All | `careerelevate_super_secret_jwt_key_2026_pro` | Secret key used for signing and verifying JWT tokens |
| `JWT_EXPIRES_IN` | All | `7d` | Expiration window for JWT authorization tokens |
| `CLIENT_URL` | All | `http://localhost:3000` | Whitelisted origin URL for CORS configuration |
| `GEMINI_API_KEY` | All | Optional | Google Gemini API Key for ATS Resume Audits and Dynamic Question Generation |
| `SMTP_HOST` | Prod | `smtp.gmail.com` | SMTP Server hostname for email notifications |
| `SMTP_PORT` | Prod | `587` | SMTP Server port |
| `SMTP_USER` | Prod | None | Sending email address |
| `SMTP_PASS` | Prod | None | SMTP 16-character App Password |
| `FROM_EMAIL` | Prod | `"CareerElevate AI" <noreply@careerelevate.ai>` | Email Sender display header |

---

## 💻 Frontend Environment Variables (`.env`)

| Variable Name | Environment | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | All | `http://localhost:5000/api/v1` | Base REST API URL pointing to Express backend |
