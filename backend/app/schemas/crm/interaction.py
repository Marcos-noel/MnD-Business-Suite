from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class InteractionCreate(APIModel):
    customer_id: str
    channel: str = Field(default="email", pattern=r"^(call|email|meeting)$")
    summary: str = Field(min_length=2, max_length=500)


class InteractionRead(Timestamped):
    org_id: str
    customer_id: str
    channel: str
    summary: str
    occurred_at: str

