from __future__ import annotations

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class Opportunity(TenantScopedBase):
    __tablename__ = "crm_opportunities"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("crm_customers.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    stage: Mapped[str] = mapped_column(String(40), default="lead")  # lead/qualified/proposal/won/lost
    value: Mapped[float] = mapped_column(Numeric(12, 2), default=0)

