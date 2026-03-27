from __future__ import annotations

from datetime import date, timedelta

from app.models.finance.transaction import Transaction
from app.repositories.finance.transaction import TransactionRepository
from app.services.base import BaseService
from app.services.finance.payment_strategies import get_payment_strategy


class FinanceService(BaseService):
    async def create_transaction(self, *, org_id: str, data: dict) -> Transaction:
        tx = Transaction(org_id=org_id, **data)
        created = await TransactionRepository(self.session).create(tx)
        await self.publish("finance.transaction_created", {"org_id": org_id, "transaction_id": created.id})
        return created

    async def list_transactions(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[Transaction]:
        return await TransactionRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def profit_snapshot(self, *, org_id: str, days: int = 30) -> dict:
        end = date.today()
        start = end - timedelta(days=days)
        repo = TransactionRepository(self.session)
        revenue = await repo.sum_by_kind(org_id=org_id, kind="revenue", start=start, end=end)
        expenses = await repo.sum_by_kind(org_id=org_id, kind="expense", start=start, end=end)
        return {"revenue": round(revenue, 2), "expenses": round(expenses, 2), "profit": round(revenue - expenses, 2)}

    async def collect_payment(
        self,
        *,
        org_id: str,
        amount: float,
        provider: str,
        reference: str,
        description: str,
        source_type: str = "",
        source_id: str = "",
    ) -> Transaction:
        strategy = get_payment_strategy(provider)
        provider_data = await strategy.collect(amount=amount, reference=reference, description=description)
        tx = Transaction(
            org_id=org_id,
            day=date.today(),
            kind="revenue",
            category="payments",
            provider=provider_data["provider"],
            reference=provider_data["reference"],
            source_type=source_type or "",
            source_id=source_id or "",
            amount=amount,
            description=provider_data["description"],
        )
        created = await TransactionRepository(self.session).create(tx)
        await self.publish("finance.payment_collected", {"org_id": org_id, "transaction_id": created.id})
        return created
