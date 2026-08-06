# 🌐 Production Deployment Guide - CareerElevate AI

This guide walks you through deploying **CareerElevate AI** to production using **Render** (Node.js Express Backend), **Netlify** (React Frontend), and **MongoDB Atlas** (Database).

---

## 🗄️ Step 1: Set Up MongoDB Atlas Database

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (Free M0 or Shared).
3. Under **Database Access**, create a Database User (e.g. `careerelevate_admin`) with password.
4. Under **Network Access**, add IP Address `0.0.0.0/0` (Allow Access from Anywhere for Render).
5. Click **Connect** -> **Drivers** -> Copy the connection string:
   ```
   mongodb+srv://careerelevate_admin:<password>@cluster0.mongodb.net/careerelevate?retryWrites=true&w=majority
   ```

---

## 🚀 Step 2: Deploy Backend to Render

1. Push your project repository to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure settings:
   - **Name**: `careerelevate-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Add **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://careerelevate_admin:<password>@cluster0.mongodb.net/careerelevate?retryWrites=true&w=majority
   JWT_SECRET=your_production_jwt_secret_key_2026_secure
   JWT_EXPIRES_IN=7d
   CLIENT_URL=https://careerelevate-ai.netlify.app
   GEMINI_API_KEY=your_gemini_api_key_here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   FROM_EMAIL="CareerElevate AI" <your_email@gmail.com>
   ```
7. Click **Deploy Web Service**.
8. Note down your backend live URL: `https://careerelevate-api.onrender.com`.

---

## ⚡ Step 3: Deploy Frontend to Netlify

1. Log in to [Netlify](https://www.netlify.com/).
2. Click **Add new site** -> **Import an existing project**.
3. Select your GitHub repository.
4. Configure build parameters:
   - **Base Directory**: `/` (or leave blank)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Add **Environment Variables**:
   ```env
   VITE_API_URL=https://careerelevate-api.onrender.com/api/v1
   ```
6. Click **Deploy Site**.
7. Create a single-page app redirect rule inside `public/_redirects`:
   ```
   /*    /index.html   200
   ```

---

## 🔍 Step 4: Verification Checklist

1. Open your Netlify Frontend URL (e.g. `https://careerelevate-ai.netlify.app`).
2. Test Registering a new candidate account.
3. Open `https://careerelevate-api.onrender.com/api-docs` to view live interactive Swagger documentation.
4. Verify `https://careerelevate-api.onrender.com/api/v1/health` returns `200 OK` with status `healthy`.
