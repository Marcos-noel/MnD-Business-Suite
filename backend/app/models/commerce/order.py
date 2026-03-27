from __future__ import annotations

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class CommerceOrder(TenantScopedBase):
    __tablename__ = "com_orders"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    order_no: Mapped[str] = mapped_column(String(40), index=True, default="")

    customer_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("crm_customers.id", ondelete="SET NULL"), nullable=True, default=None
    )
    customer_name: Mapped[str] = mapped_column(String(200), default="")
    customer_email: Mapped[str] = mapped_column(String(255), default="")

    currency: Mapped[str] = mapped_column(String(3), default="KES")
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    tax: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    shipping: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    total: Mapped[float] = mapped_column(Numeric(12, 2), default=0)

    status: Mapped[str] = mapped_column(String(30), default="pending_payment", index=True)
    payment_status: Mapped[str] = mapped_column(String(30), default="unpaid", index=True)
    payment_provider: Mapped[str] = mapped_column(String(40), default="")
    payment_reference: Mapped[str] = mapped_column(String(80), default="", index=True)
