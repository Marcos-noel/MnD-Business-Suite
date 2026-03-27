from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel


class ReadinessItem(APIModel):
    code: str
    title: str
    status: str = Field(pattern=r"^(missing|partial|complete)$")
    points: int = Field(ge=0, le=100)
    recommendation: str = ""


class ExportReadinessScore(APIModel):
    score: int = Field(ge=0, le=100)
    items: list[ReadinessItem]

