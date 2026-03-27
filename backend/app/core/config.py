from __future__ import annotations

from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "MnD Business Suite"
    environment: str = "development"
    debug: bool = True

    api_v1_prefix: str = "/api/v1"
    allowed_origins: str = "http://localhost:3000"
    frontend_base_url: str = "http://localhost:3000"

    database_url: str
    redis_url: str
    log_level: str = "INFO"

    jwt_issuer: str = "mnd-business-suite"
    jwt_audience: str = "mnd-users"
    jwt_secret_key: str
    jwt_access_token_expires_minutes: int = 15
    jwt_refresh_token_expires_days: int = 14

    password_bcrypt_rounds: int = 12

    rate_limit_default: str = "100/minute"

    restricted_export_countries: str = ""

    # Stripe configuration
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    stripe_webhook_secret: str = ""

    # Frontend URL for redirects
    frontend_url: str = "http://localhost:3000"

    cookie_secure: bool = False
    cookie_samesite: str = "lax"
    allow_public_registration: bool = True

    @field_validator("debug", mode="before")
    @classmethod
    def _parse_debug(cls, v: Any) -> Any:
        if isinstance(v, str):
            lv = v.strip().lower()
            if lv in {"release", "prod", "production"}:
                return False
            if lv in {"debug", "dev", "development"}:
                return True
        return v

    @field_validator("cookie_samesite", mode="before")
    @classmethod
    def _normalize_samesite(cls, v: Any) -> str:
        if v is None:
            return "lax"
        s = str(v).strip().lower()
        if s not in {"lax", "strict", "none"}:
            return "lax"
        return s


def should_use_secure_cookies() -> bool:
    if settings.cookie_secure:
        return True
    return settings.environment.strip().lower() in {"prod", "production"}


settings = Settings()


def restricted_countries() -> set[str]:
    return {c.strip().lower() for c in settings.restricted_export_countries.split(",") if c.strip()}
