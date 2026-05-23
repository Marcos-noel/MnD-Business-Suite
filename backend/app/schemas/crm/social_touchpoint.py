from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class SocialTouchpointCreate(APIModel):
    customer_id: str
    platform: str = Field(pattern=r"^(whatsapp|facebook|instagram|linkedin|x|telegram|tiktok)$")
    direction: str = Field(default="inbound", pattern=r"^(inbound|outbound)$")
    external_message_id: str = Field(default="", max_length=120)
    status: str = Field(default="received", pattern=r"^(received|sent|delivered|read|failed)$")
    content_preview: str = Field(default="", max_length=500)


class SocialTouchpointRead(Timestamped):
    org_id: str
    customer_id: str
    platform: str
    direction: str
    external_message_id: str
    status: str
    content_preview: str
    occurred_at: str
