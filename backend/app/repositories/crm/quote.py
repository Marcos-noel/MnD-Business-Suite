from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.crm.quote import Quote, QuoteLine
from app.repositories.tenant_base import TenantRepository


class QuoteRepository(TenantRepository[Quote]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Quote)


class QuoteLineRepository(TenantRepository[QuoteLine]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, QuoteLine)
