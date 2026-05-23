from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class QuoteEmailLog(TenantScopedBase):
    __tablename__ = "crm_quote_email_logs"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    quote_id: Mapped[str] = mapped_column(String(36), ForeignKey("crm_quotes.id", ondelete="CASCADE"), index=True)
    to_email: Mapped[str] = mapped_column(String(255), index=True)
    subject: Mapped[str] = mapped_column(String(255))
    provider: Mapped[str] = mapped_column(String(50), default="mock")
    provider_message_id: Mapped[str] = mapped_column(String(120), default="", index=True)
    status: Mapped[str] = mapped_column(String(30), default="queued", index=True)  # queued/sent/delivered/opened/clicked/failed
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
