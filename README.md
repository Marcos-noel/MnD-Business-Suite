# MnD Business Suite

Production-ready, modular, multi-tenant SaaS platform for SMEs.

## Quickstart (local)

### 1) Start full stack (Docker)

```powershell
docker compose up -d
```

Frontend: `http://localhost:3000`  
Backend docs: `http://localhost:8000/api/v1/docs`

### 2) Backend (FastAPI)

```powershell
cd backend
copy .env.example .env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Seed demo data (optional):

```powershell
python -m app.utils.seed
```

API docs:
- Swagger: `http://localhost:8000/api/v1/docs`
- OpenAPI: `http://localhost:8000/api/v1/openapi.json`

### 3) Frontend (Next.js)

```powershell
cd ..\frontend
copy .env.example .env.local
npm install
npm run dev
```

Open: `http://localhost:3000`

## Default demo credentials (after seeding)

- Org slug: `MnD`
- Email: `admin@mnd.com`
- Password: `AdminPass123!`
