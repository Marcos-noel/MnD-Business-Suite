# MnD Business Suite - Vercel + Render Deployment Guide

This guide will help you deploy the MnD Business Suite using Vercel (frontend) and Render (backend).

## Prerequisites
- GitHub account with your repository connected
- Vercel account (sign up at https://vercel.com)
- Render account (sign up at https://render.com)

---

## Step 1: Deploy Backend on Render

### Option A: Deploy from GitHub (Recommended)

1. **Log in to Render** at https://render.com
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub account and select the `MnD-Business-Suite` repository
4. In the "Root Directory" field, enter: `backend`
5. Configure the following:

   | Setting | Value |
   |---------|-------|
   | Name | `mnd-backend` |
   | Environment | `Python` |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

6. Click **"Create Web Service"**

### Backend Environment Variables
After deployment, go to the **Environment** tab and add:

```
APP_NAME="MnD Business Suite"
ENVIRONMENT="production"
DEBUG=false
API_V1_PREFIX="/api/v1"
ALLOWED_ORIGINS="https://your-app.vercel.app"
DATABASE_URL="sqlite+aiosqlite:///./mnd.db"
JWT_ISSUER="mnd-business-suite"
JWT_AUDIENCE="mnd-users"
# IMPORTANT: Generate a secure random secret!
JWT_SECRET_KEY="your-very-long-random-secret-key-here"
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRES_DAYS=14
PASSWORD_BCRYPT_ROUNDS=12
RATE_LIMIT_DEFAULT="100/minute"
FRONTEND_BASE_URL="https://your-app.vercel.app"
COOKIE_SECURE=true
COOKIE_SAMESITE="none"
```

> **Important**: Generate a secure JWT_SECRET_KEY (use a random string at least 32 characters long)

---

## Step 2: Deploy Frontend on Vercel

1. **Log in to Vercel** at https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository (`MnD-Business-Suite`)
4. In the "Root Directory" field, enter: `frontend`
5. Configure the following:

   | Setting | Value |
   |---------|-------|
   | Framework Preset | `Next.js` |
   | Build Command | `npm run build` (default) |
   | Output Directory | `.next` (default) |

6. Click **"Deploy"**

### Frontend Environment Variables
After deployment, go to **Settings** → **Environment Variables** and add:

```
NEXT_PUBLIC_BACKEND_URL="https://mnd-backend.onrender.com"
COOKIE_SECURE=true
NODE_ENV=production
```

---

## Step 3: Connect Frontend to Backend

1. Once both services are deployed, copy your **Render Backend URL** (e.g., `https://mnd-backend.onrender.com`)
2. Update the Frontend's `NEXT_PUBLIC_BACKEND_URL` variable with your backend URL
3. Update the Backend's `ALLOWED_ORIGINS` to include your Vercel frontend URL
4. Redeploy both services

---

## Quick Reference

| Service | Platform | Build Command | Start Command |
|---------|----------|---------------|---------------|
| Backend | Render | `pip install -r requirements.txt` | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Frontend | Vercel | `npm run build` | `npm run start` |

---

## Troubleshooting

### Backend Issues
- **Database**: The app uses SQLite by default. For production, consider using Render's PostgreSQL addon
- **Static Files**: Ensure all routes are properly configured
- **CORS**: If frontend can't connect, check `ALLOWED_ORIGINS` includes your Vercel URL

### Frontend Issues
- **Environment Variables**: Make sure `NEXT_PUBLIC_BACKEND_URL` points to your deployed backend
- **Build Errors**: Check that all dependencies are in package.json

---

## Optional: PostgreSQL Database (Recommended for Production)

### On Render:
1. In your Render dashboard, click **"New"** → **"PostgreSQL"**
2. Once provisioned, copy the `Internal Database URL`
3. Update your backend's `DATABASE_URL` with the PostgreSQL connection string
4. Format: `postgresql+asyncpg://user:password@host:port/database`

---

## Files Created

- `backend/.env.production` - Production environment template for Render
- `frontend/.env.production` - Production environment template for Vercel