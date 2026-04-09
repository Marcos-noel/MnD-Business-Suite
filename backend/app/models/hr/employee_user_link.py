from __future__ import annotations

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class EmployeeUserLink(TenantScopedBase):
    __tablename__ = "hr_employee_user_links"
    __table_args__ = (
        UniqueConstraint("org_id", "employee_id", name="uq_hr_employee_user_employee"),
        UniqueConstraint("org_id", "user_id", name="uq_hr_employee_user_user"),
    )

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    employee_id: Mapped[str] = mapped_column(String(36), ForeignKey("hr_employees.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("auth_users.id", ondelete="CASCADE"), index=True)

