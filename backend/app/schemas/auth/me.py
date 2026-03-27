from __future__ import annotations

from app.schemas.common import APIModel


class UserMeRead(APIModel):
    org_id: str
    org_name: str
    org_slug: str
    org_logo_url: str = ""
    user_id: str
    email: str
    full_name: str
    avatar_url: str = ""
    roles: list[str]
    permissions: list[str]
    enabled_modules: list[str]
