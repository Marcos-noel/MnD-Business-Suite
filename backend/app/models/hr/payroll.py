from __future__ import annotations

from sqlalchemy import ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class PayrollStructure(TenantScopedBase):
    __tablename__ = "hr_payroll_structures"
    __table_args__ = (UniqueConstraint("org_id", "name", name="uq_payroll_name"),)

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    base_salary: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    housing_allowance: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    transport_allowance: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    tax_rate: Mapped[float] = mapped_column(Numeric(5, 4), default=0.15)

