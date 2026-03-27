# Setup Guide

## Prereqs
- Python 3.12+
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

Optional (recommended for local): Docker Desktop.

## Local run

### 1) Start infrastructure

From repo root:

```powershell
docker compose up -d
```

This starts: PostgreSQL, Redis, backend API, background worker, and frontend.

### 2) Backend

```powershell
cd backend
copy .env.example .env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Seed demo data:

```powershell
python -m app.utils.seed
```

Background worker (for export document generation):

```powershell
python -m app.workers.worker
```

### 3) Frontend

```powershell
cd ..\frontend
copy .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`

## Pilot deployment (Vercel + Render)

### Backend (Render)
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add env vars from `backend/.env.example` (set strong `JWT_SECRET_KEY`)
- Provision PostgreSQL + Redis add-ons

### Frontend (Vercel)
- Add env var `BACKEND_URL` pointing to Render backend base URL
