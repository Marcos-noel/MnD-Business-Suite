from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import jwt

from app.core.config import settings

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=int(settings.password_bcrypt_rounds))
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_token_jti() -> str:
    return secrets.token_urlsafe(32)


def _jwt_base_claims() -> dict[str, Any]:
    return {
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "iat": int(datetime.now(timezone.utc).timestamp()),
    }


def create_access_token(*, subject: str, org_id: str, roles: list[str], expires_minutes: int | None = None) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes or settings.jwt_access_token_expires_minutes)
    payload = {
        **_jwt_base_claims(),
        "type": "access",
        "sub": subject,
        "org_id": org_id,
        "roles": roles,
        "jti": create_token_jti(),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")


def create_refresh_token(*, subject: str, org_id: str, token_family: str, expires_days: int | None = None) -> tuple[str, str]:
    exp = datetime.now(timezone.utc) + timedelta(days=expires_days or settings.jwt_refresh_token_expires_days)
    jti = create_token_jti()
    raw = secrets.token_urlsafe(48)
    payload = {
        **_jwt_base_claims(),
        "type": "refresh",
        "sub": subject,
        "org_id": org_id,
        "family": token_family,
        "jti": jti,
        "rt": raw,
        "exp": int(exp.timestamp()),
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")
    token_hash = hashlib.sha256(f"{jti}.{raw}".encode("utf-8")).hexdigest()
    return token, token_hash


def create_qr_token(*, org_id: str, action: str, expires_seconds: int = 90) -> str:
    exp = datetime.now(timezone.utc) + timedelta(seconds=expires_seconds)
    payload = {
        **_jwt_base_claims(),
        "type": "qr",
        "org_id": org_id,
        "action": action,
        "jti": create_token_jti(),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=["HS256"],
        issuer=settings.jwt_issuer,
        audience=settings.jwt_audience,
        options={"verify_signature": True, "verify_aud": True, "verify_iss": True},
    )
