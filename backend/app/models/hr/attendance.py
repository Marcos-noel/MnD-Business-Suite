from __future__ import annotations

from datetime import date

from sqlalchemy import Date, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class Attendance(TenantScopedBase):
    __tablename__ = "hr_attendance"
    __table_args__ = (UniqueConstraint("org_id", "employee_id", "day", name="uq_attendance_day"),)

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("hr_employees.id", ondelete="CASCADE"), index=True)
    day: Mapped[date] = mapped_column(Date, index=True)
    status: Mapped[str] = mapped_column(String(40), default="present")  # present/absent/leave

