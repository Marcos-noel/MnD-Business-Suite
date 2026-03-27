from __future__ import annotations

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hr.leave_request import LeaveRequest
from app.repositories.tenant_base import TenantRepository


class LeaveRequestRepository(TenantRepository[LeaveRequest]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, LeaveRequest)

    async def list_for_employee(self, *, org_id: str, employee_id: str, limit: int = 50, offset: int = 0) -> list[LeaveRequest]:
        res = await self.session.execute(
            select(LeaveRequest)
            .where(LeaveRequest.org_id == org_id)
            .where(LeaveRequest.employee_id == employee_id)
            .order_by(desc(LeaveRequest.created_at))
            .limit(limit)
            .offset(offset)
        )
        return list(res.scalars().all())

    async def list_all(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[LeaveRequest]:
        res = await self.session.execute(
            select(LeaveRequest)
            .where(LeaveRequest.org_id == org_id)
            .order_by(desc(LeaveRequest.created_at))
            .limit(limit)
            .offset(offset)
        )
        return list(res.scalars().all())

