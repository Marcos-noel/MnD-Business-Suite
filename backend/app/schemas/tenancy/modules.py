from __future__ import annotations

from datetime import datetime

from pydantic import Field

from app.schemas.common import APIModel


class OrgModuleRead(APIModel):
    module_code: str
    is_enabled: bool
    plan: str
    subscribed_until: datetime | None


class OrgModuleUpdate(APIModel):
    is_enabled: bool = Field(default=True)

