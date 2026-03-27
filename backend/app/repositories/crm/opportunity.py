from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.crm.opportunity import Opportunity
from app.repositories.tenant_base import TenantRepository


class OpportunityRepository(TenantRepository[Opportunity]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Opportunity)

    async def pipeline_value(self, *, org_id: str, stages: list[str]) -> float:
        res = await self.session.execute(
            select(func.coalesce(func.sum(Opportunity.value), 0))
            .where(Opportunity.org_id == org_id)
            .where(Opportunity.stage.in_(stages))
        )
        return float(res.scalar_one())

