from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel


class SocialDispatchRequest(APIModel):
    customer_id: str
    platform: str = Field(pattern=r"^(whatsapp|facebook|instagram|linkedin|x|telegram|tiktok)$")
    recipient: str = Field(min_length=2, max_length=120)
    message: str = Field(min_length=1, max_length=2000)
