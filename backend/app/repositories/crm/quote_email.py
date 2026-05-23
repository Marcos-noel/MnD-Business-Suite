from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.crm.quote_email import QuoteEmailLog
from app.repositories.tenant_base import TenantRepository


class QuoteEmailLogRepository(TenantRepository[QuoteEmailLog]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, QuoteEmailLog)
