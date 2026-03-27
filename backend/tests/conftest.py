from __future__ import annotations

import os


def pytest_configure() -> None:
    os.environ.setdefault("APP_NAME", "MnD Test")
    os.environ.setdefault("ENVIRONMENT", "test")
    os.environ.setdefault("DEBUG", "false")
    os.environ.setdefault("API_V1_PREFIX", "/api/v1")
    os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:3000")
    os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test_mnd.db")
    os.environ.setdefault("REDIS_URL", "redis://localhost:6379/15")
    os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-change-me")
    os.environ.setdefault("JWT_ISSUER", "mnd-test")
    os.environ.setdefault("JWT_AUDIENCE", "mnd-test-users")

