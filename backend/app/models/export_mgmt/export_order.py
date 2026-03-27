from __future__ import annotations

from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class ExportOrder(TenantScopedBase):
    __tablename__ = "exp_orders"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("crm_customers.id", ondelete="CASCADE"), index=True)
    order_no: Mapped[str] = mapped_column(String(60), index=True)
    destination_country: Mapped[str] = mapped_column(String(80))
    order_date: Mapped[date] = mapped_column(Date, index=True)
    status: Mapped[str] = mapped_column(String(30), default="draft")  # draft/confirmed/shipped/delivered

