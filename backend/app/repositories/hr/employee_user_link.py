from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hr.employee_user_link import EmployeeUserLink
from app.repositories.tenant_base import TenantRepository


class EmployeeUserLinkRepository(TenantRepository[EmployeeUserLink]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, EmployeeUserLink)

    async def get_by_user_id(self, *, org_id: str, user_id: str) -> EmployeeUserLink | None:
        res = await self.session.execute(
            select(EmployeeUserLink).where(EmployeeUserLink.org_id == org_id).where(EmployeeUserLink.user_id == user_id)
        )
        return res.scalar_one_or_none()

