from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class SocialTouchpoint(TenantScopedBase):
    __tablename__ = "crm_social_touchpoints"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("crm_customers.id", ondelete="CASCADE"), index=True)
    platform: Mapped[str] = mapped_column(String(30), index=True)  # whatsapp/facebook/instagram/linkedin/x
    direction: Mapped[str] = mapped_column(String(10), default="inbound")  # inbound/outbound
    external_message_id: Mapped[str] = mapped_column(String(120), default="", index=True)
    status: Mapped[str] = mapped_column(String(30), default="received")  # received/sent/delivered/read/failed
    content_preview: Mapped[str] = mapped_column(String(500), default="")
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
