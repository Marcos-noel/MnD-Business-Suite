from __future__ import annotations

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.finance.transaction import Transaction
from app.repositories.tenant_base import TenantRepository


class TransactionRepository(TenantRepository[Transaction]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Transaction)

    async def sum_by_kind(self, *, org_id: str, kind: str, start: date, end: date) -> float:
        res = await self.session.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0))
            .where(Transaction.org_id == org_id)
            .where(Transaction.kind == kind)
            .where(Transaction.day >= start)
            .where(Transaction.day <= end)
        )
        return float(res.scalar_one())

