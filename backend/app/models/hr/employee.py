from __future__ import annotations

from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class Employee(TenantScopedBase):
    __tablename__ = "hr_employees"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    employee_no: Mapped[str] = mapped_column(String(40), index=True)
    full_name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(255), default="", index=True)
    role_title: Mapped[str] = mapped_column(String(120), default="")
    payroll_structure_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("hr_payroll_structures.id", ondelete="SET NULL"), nullable=True, index=True
    )
    hire_date: Mapped[date] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(default=True)
