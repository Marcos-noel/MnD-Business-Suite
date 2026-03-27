from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.errors import UnauthorizedError
from app.core.security import decode_token


bearer = HTTPBearer(auto_error=False)


class AuthContext:
    def __init__(self, *, user_id: str, org_id: str, roles: list[str]):
        self.user_id = user_id
        self.org_id = org_id
        self.roles = roles


async def get_auth_context(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> AuthContext:
    if creds is None or not creds.credentials:
        raise UnauthorizedError("Missing bearer token")
    try:
        claims = decode_token(creds.credentials)
    except Exception:
        raise UnauthorizedError("Invalid or expired token")
    if claims.get("type") != "access":
        raise UnauthorizedError("Invalid token type")

    user_id = claims.get("sub")
    org_id = claims.get("org_id")
    if not user_id or not org_id:
        raise UnauthorizedError("Invalid token claims")
    return AuthContext(user_id=user_id, org_id=org_id, roles=claims.get("roles", []))


CurrentAuth = Annotated[AuthContext, Depends(get_auth_context)]
