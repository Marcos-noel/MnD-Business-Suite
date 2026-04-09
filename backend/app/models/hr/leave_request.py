from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class LeaveRequest(TenantScopedBase):
    __tablename__ = "hr_leave_requests"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("hr_employees.id", ondelete="CASCADE"), index=True)

    start_day: Mapped[date] = mapped_column(Date, index=True)
    end_day: Mapped[date] = mapped_column(Date, index=True)
    leave_type: Mapped[str] = mapped_column(String(40), default="annual")  # annual/sick/unpaid/...
    reason: Mapped[str] = mapped_column(String(500), default="")

    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/approved/rejected/canceled
    reviewed_by_user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("auth_users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    decision_note: Mapped[str] = mapped_column(String(500), default="")

