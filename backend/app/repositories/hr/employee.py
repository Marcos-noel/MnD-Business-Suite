from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hr.employee import Employee
from app.repositories.tenant_base import TenantRepository


class EmployeeRepository(TenantRepository[Employee]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Employee)

    async def get_by_employee_no(self, *, org_id: str, employee_no: str) -> Employee | None:
        res = await self.session.execute(
            select(Employee).where(Employee.org_id == org_id).where(Employee.employee_no == employee_no)
        )
        return res.scalar_one_or_none()

