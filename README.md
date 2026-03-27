# MnD Business Suite

A comprehensive full-stack SaaS platform serving as a direct competitor to Microsoft 365, built with modern technologies for small and medium enterprises.

## 🌟 Features

- **Multi-tenant Architecture**: Organizations can create their own workspaces with isolated data
- **Modular Applications**: Each business module operates as an independent service
- **Cross-Application SSO**: Single sign-on across all applications
- **Role-Based Access Control**: Granular permissions per application and user role
- **Stripe Integration**: Multi-tier subscription billing with payment processing

### Available Modules

| Module | Description |
|--------|-------------|
| **HR** | Employee management, attendance, leave requests, payroll |
| **CRM** | Customer relationships, interactions, opportunities |
| **Finance** | Transactions, accounting, payment tracking |
| **Inventory** | Products, stock movements, suppliers |
| **Commerce** | Orders, cart, checkout |
| **Export Management** | Export documentation, readiness, shipments |
| **Analytics** | Business insights and reporting |
| **Assistant** | AI-powered business assistant |

## 🏗️ Architecture

### Technology Stack

- **Backend**: Python FastAPI with async SQLAlchemy
- **Frontend**: Next.js 14 with React and TypeScript
- **Database**: PostgreSQL (multi-tenant with row-level security)
- **Cache**: Redis for sessions and caching
- **Payments**: Stripe for subscription management
- **Container**: Docker & Docker Compose

### Project Structure

```
MnD-Business-Suite/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/v1/         # API routes
│   │   ├── models/         # SQLAlchemy models
│   │   ├── repositories/   # Data access layer
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── core/          # Config, security, etc.
│   └── requirements.txt
├── frontend/               # Next.js application
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── lib/               # Utilities
├── .github/workflows/     # CI/CD pipelines
├── docker-compose.yml     # Local development
└── README.md
```

## 💰 Subscription Model

### Plan Types

#### Individual App Plans
- Purchase access to specific modules (HR, CRM, Finance, etc.)
- Each app has its own pricing tier

#### Business Suite Plans
- Access to all applications under one subscription
- Tier-based access levels

### Plan Tiers

| Tier | Features |
|------|----------|
| **Starter** | Basic features, 5 users, 10GB storage |
| **Standard** | Full features, 25 users, 100GB storage |
| **Professional** | Advanced features, 100 users, 500GB storage |
| **Enterprise** | Unlimited users, custom storage, priority support |

### Billing Intervals
- Monthly billing
- Yearly billing (20% discount)

## 🚀 Quickstart

### 1) Start with Docker

```powershell
docker compose up -d
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/v1/docs`

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

### 3) Frontend (Next.js)

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Open: `http://localhost:3000`

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/mndbusiness
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRES_DAYS=14

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🔧 Deployment

### Docker Production Stack

```yaml
# production.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: mnduser
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: mndbusiness
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7

  backend:
    image: ghcr.io/marcos-noel/mnd-business-suite-backend:latest
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/mndbusiness
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      - postgres
      - redis

  frontend:
    image: ghcr.io/marcos-noel/mnd-business-suite-frontend:latest
    ports:
      - "3000:3000"
```

### CI/CD

GitHub Actions automatically builds and pushes Docker images on push to main/master:

1. **Backend Tests**: Linting, type checking, unit tests
2. **Frontend Tests**: Linting, build verification  
3. **Docker Build**: Multi-platform images to GHCR
4. **Deploy**: Ready for production deployment

## 📚 API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/api/v1/docs`
- OpenAPI JSON: `http://localhost:8000/api/v1/openapi.json`

## 🔑 Default Demo Credentials

After seeding:
- Organization: `MnD`
- Email: `admin@mnd.com`
- Password: `AdminPass123!`

## 🛡️ Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- API rate limiting
- CORS configuration
- Security headers
- Input validation with Pydantic
- SQL injection prevention via ORM

## 📄 License

Proprietary - All rights reserved

## 👥 Contributing

This is a commercial product. For partnership inquiries, contact the maintainers.
