# Architecture

## Backend (`backend/app/`)

Strict layers (no business logic in routes):
- `core/`: config, DB, security, cache, rate limiting, events
- `models/`: SQLAlchemy domain entities
- `schemas/`: Pydantic request/response contracts
- `repositories/`: data access (tenant-scoped repositories enforce `org_id`)
- `services/`: business logic (OOP service classes, strategies, rules, events)
- `api/`: versioned routes (`/api/v1`)
- `utils/`: seed + helpers
- `workers/`: Redis/RQ background jobs

### Multi-tenancy
- Every domain entity is `TenantScopedBase` with `org_id`
- Queries are always filtered by `org_id` in repositories/services
- JWT access token includes `org_id` claim; `CurrentAuth` dependency extracts it

### Security
- Password hashing: bcrypt
- JWT access + refresh; refresh tokens are rotated and stored as SHA-256 hashes
- RBAC: roles are org-scoped, permissions are global; enforced via `require_permission(...)`
- Rate limiting: SlowAPI
- CORS: env-driven

### Extensibility (plug-and-play)
- Export rules: `app/services/export_mgmt/rules.py` registry (register new `ExportRule` without changing routes)
- Payments: `app/services/finance/payment_strategies.py` strategy interface (add providers without touching endpoints)
- Event bus: `app/core/events.py` publish/subscribe hooks

## Frontend (`frontend/`)

Next.js App Router + Tailwind + Framer Motion:
- Premium dark UI with glassmorphism + soft shadows
- Collapsible sidebar + top navigation
- Server route handlers proxy requests to backend (`/api/proxy/...`) and manage httpOnly tokens

