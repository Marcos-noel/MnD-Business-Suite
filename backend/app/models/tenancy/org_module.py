from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class OrgModule(BaseModel):
    __tablename__ = "org_modules"
    __table_args__ = (UniqueConstraint("org_id", "module_code", name="uq_org_module"),)

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    module_code: Mapped[str] = mapped_column(String(50), index=True)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    plan: Mapped[str] = mapped_column(String(50), default="standard")
    subscribed_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

