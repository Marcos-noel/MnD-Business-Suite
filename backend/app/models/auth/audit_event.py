from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class AuditEvent(TenantScopedBase):
    __tablename__ = "audit_events"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    actor_user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("auth_users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    module: Mapped[str] = mapped_column(String(80), index=True)  # crm/rbac/finance/...
    entity_type: Mapped[str] = mapped_column(String(80), index=True)  # customer/opportunity/quote/...
    entity_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    action: Mapped[str] = mapped_column(String(80), index=True)
    summary: Mapped[str] = mapped_column(String(255), default="")
    before_json: Mapped[str] = mapped_column(Text, default="")
    after_json: Mapped[str] = mapped_column(Text, default="")
