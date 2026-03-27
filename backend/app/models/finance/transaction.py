from __future__ import annotations

from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class Transaction(TenantScopedBase):
    __tablename__ = "fin_transactions"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    day: Mapped[date] = mapped_column(Date, index=True)
    kind: Mapped[str] = mapped_column(String(20), index=True)  # revenue/expense
    category: Mapped[str] = mapped_column(String(80), default="general")
    provider: Mapped[str] = mapped_column(String(40), default="manual")  # cash/mobile_money/bank/manual
    reference: Mapped[str] = mapped_column(String(80), default="", index=True)
    source_type: Mapped[str] = mapped_column(String(40), default="", index=True)
    source_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2))
    description: Mapped[str] = mapped_column(String(255), default="")
