from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hr.payroll import PayrollStructure
from app.repositories.tenant_base import TenantRepository


class PayrollRepository(TenantRepository[PayrollStructure]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, PayrollStructure)

