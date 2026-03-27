# Railway Deployment Guide for MnD Business Suite

This guide will help you deploy both the backend (FastAPI) and frontend (Next.js) on Railway.

## Prerequisites
- GitHub account with your repository connected
- Railway account (sign up at https://railway.app)

---

## Step 1: Deploy Backend (FastAPI)

1. **Log in to Railway** at https://railway.app
2. Click **"New Project"** → Select **"Empty Project"**
3. Click **"Add New"** → **"GitHub Repo"**
4. Select your repository (`MnD-Business-Suite`)
5. Select the **backend** folder as the root directory
6. Railway will auto-detect Python - confirm the settings
7. Click **"Deploy"**

### Backend Environment Variables
After deployment, go to the **Variables** tab and add:

```
APP_NAME="MnD Business Suite"
ENVIRONMENT="production"
DEBUG=false
API_V1_PREFIX="/api/v1"
ALLOWED_ORIGINS="*"
DATABASE_URL="sqlite+aiosqlite:///./mnd.db"
JWT_ISSUER="mnd-business-suite"
JWT_AUDIENCE="mnd-users"
# IMPORTANT: Generate a secure random secret!
JWT_SECRET_KEY="your-very-long-random-secret-key-here"
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRES_DAYS=14
PASSWORD_BCRYPT_ROUNDS=12
RATE_LIMIT_DEFAULT="100/minute"
FRONTEND_BASE_URL="your-frontend-url"
COOKIE_SECURE=true
COOKIE_SAMESITE="none"
```

> **Important**: Generate a secure JWT_SECRET_KEY (use a random string at least 32 characters long)

---

## Step 2: Deploy Frontend (Next.js)

1. In the same Railway project, click **"Add New"** → **"GitHub Repo"**
2. Select your repository again
3. This time, select the **frontend** folder as the root directory
4. Railway will auto-detect Node.js - confirm the settings
5. Click **"Deploy"**

### Frontend Environment Variables
After deployment, go to the **Variables** tab and add:

```
NEXT_PUBLIC_BACKEND_URL="https://your-backend-app.railway.app"
COOKIE_SECURE=true
NODE_ENV=production
```

---

## Step 3: Connect Frontend to Backend

1. Once both services are deployed, copy the **Backend URL** from Railway
2. Update the Frontend's `NEXT_PUBLIC_BACKEND_URL` variable with the backend URL
3. Update the Backend's `ALLOWED_ORIGINS` to include your frontend URL
4. Redeploy both services

---

## Quick Reference

| Service | Build Command | Start Command |
|---------|---------------|---------------|
| Backend | `pip install -r requirements.txt` | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Frontend | `npm run build` | `npm run start` |

---

## Troubleshooting

### Backend Issues
- **Database**: The app uses SQLite by default. For production, consider using Railway's PostgreSQL addon
- **Static Files**: Ensure all routes are properly configured
- **CORS**: If frontend can't connect, check `ALLOWED_ORIGINS` includes your frontend URL

### Frontend Issues
- **Environment Variables**: Make sure `NEXT_PUBLIC_BACKEND_URL` points to your deployed backend
- **Build Errors**: Check that all dependencies are in package.json

---

## Optional: PostgreSQL Database (Recommended for Production)

1. In your Railway project, click **"Add New"** → **"Database"** → **"PostgreSQL"**
2. Once provisioned, copy the `DATABASE_URL` variable
3. Update your backend's `DATABASE_URL` with the PostgreSQL connection string
4. Format: `postgresql+asyncpg://user:password@host:port/database`

---

## Files Created for Railway

- `backend/railway.json` - Railway configuration for backend
- `backend/.env.production` - Production environment template
- `frontend/railway.json` - Railway configuration for frontend
- `frontend/.env.production` - Production environment template