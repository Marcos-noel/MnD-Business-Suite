from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.crm.interaction import InteractionLog
from app.repositories.tenant_base import TenantRepository


class InteractionRepository(TenantRepository[InteractionLog]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, InteractionLog)

