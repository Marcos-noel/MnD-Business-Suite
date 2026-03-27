from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class TimeEntry(TenantScopedBase):
    __tablename__ = "hr_time_entries"
    __table_args__ = (UniqueConstraint("org_id", "employee_id", "day", name="uq_hr_time_entry_day"),)

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("hr_employees.id", ondelete="CASCADE"), index=True)
    day: Mapped[date] = mapped_column(Date, index=True)

    clock_in_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    clock_out_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)

    source: Mapped[str] = mapped_column(String(40), default="web")  # web/mobile/api
    note: Mapped[str] = mapped_column(String(255), default="")

