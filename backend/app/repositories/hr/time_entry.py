from __future__ import annotations

from datetime import date

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hr.time_entry import TimeEntry
from app.repositories.tenant_base import TenantRepository


class TimeEntryRepository(TenantRepository[TimeEntry]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, TimeEntry)

    async def get_by_day(self, *, org_id: str, employee_id: str, day: date) -> TimeEntry | None:
        res = await self.session.execute(
            select(TimeEntry)
            .where(TimeEntry.org_id == org_id)
            .where(TimeEntry.employee_id == employee_id)
            .where(TimeEntry.day == day)
        )
        return res.scalar_one_or_none()

    async def list_for_employee(self, *, org_id: str, employee_id: str, limit: int = 30) -> list[TimeEntry]:
        res = await self.session.execute(
            select(TimeEntry)
            .where(TimeEntry.org_id == org_id)
            .where(TimeEntry.employee_id == employee_id)
            .order_by(desc(TimeEntry.day))
            .limit(limit)
        )
        return list(res.scalars().all())

