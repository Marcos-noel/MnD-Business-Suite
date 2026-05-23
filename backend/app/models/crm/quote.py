from __future__ import annotations

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class Quote(TenantScopedBase):
    __tablename__ = "crm_quotes"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("crm_customers.id", ondelete="CASCADE"), index=True)
    opportunity_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("crm_opportunities.id", ondelete="SET NULL"), nullable=True, index=True
    )
    quote_no: Mapped[str] = mapped_column(String(40), index=True)
    status: Mapped[str] = mapped_column(String(30), default="draft", index=True)  # draft/review/approved/sent/accepted/rejected
    currency: Mapped[str] = mapped_column(String(8), default="USD")
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    tax: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    discount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    total: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    notes: Mapped[str] = mapped_column(String(500), default="")


class QuoteLine(TenantScopedBase):
    __tablename__ = "crm_quote_lines"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    quote_id: Mapped[str] = mapped_column(String(36), ForeignKey("crm_quotes.id", ondelete="CASCADE"), index=True)
    item_name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[float] = mapped_column(Numeric(12, 2), default=1)
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    line_total: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
