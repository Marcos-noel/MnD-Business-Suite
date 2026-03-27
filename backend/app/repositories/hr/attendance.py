from __future__ import annotations

from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hr.attendance import Attendance
from app.repositories.tenant_base import TenantRepository


class AttendanceRepository(TenantRepository[Attendance]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Attendance)

    async def get_by_day(self, *, org_id: str, employee_id: str, day: date) -> Attendance | None:
        res = await self.session.execute(
            select(Attendance)
            .where(Attendance.org_id == org_id)
            .where(Attendance.employee_id == employee_id)
            .where(Attendance.day == day)
        )
        return res.scalar_one_or_none()
