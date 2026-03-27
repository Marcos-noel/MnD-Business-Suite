from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel


class QrTokenRead(APIModel):
    token: str
    svg: str
    action: str
    expires_seconds: int = Field(default=90, ge=10, le=600)


class QrScanRequest(APIModel):
    token: str = Field(min_length=10, max_length=5000)

