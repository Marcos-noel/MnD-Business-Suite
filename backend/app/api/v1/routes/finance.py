from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_permission
from app.core.deps import DbSession
from app.schemas.finance.transaction import CollectPaymentRequest, ProfitSnapshot, TransactionCreate, TransactionRead
from app.services.finance.finance_service import FinanceService


router = APIRouter()


@router.get("/transactions", response_model=list[TransactionRead], dependencies=[require_permission("finance.manage")])
async def list_transactions(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[TransactionRead]:
    items = await FinanceService(session).list_transactions(org_id=auth.org_id, limit=limit, offset=offset)
    return [TransactionRead.model_validate(i) for i in items]


@router.post("/transactions", response_model=TransactionRead, status_code=201, dependencies=[require_permission("finance.manage")])
async def create_transaction(payload: TransactionCreate, session: DbSession, auth: CurrentAuth) -> TransactionRead:
    tx = await FinanceService(session).create_transaction(org_id=auth.org_id, data=payload.model_dump())
    return TransactionRead.model_validate(tx)


@router.get("/profit", response_model=ProfitSnapshot, dependencies=[require_permission("finance.manage")])
async def profit(session: DbSession, auth: CurrentAuth, days: int = 30) -> ProfitSnapshot:
    snap = await FinanceService(session).profit_snapshot(org_id=auth.org_id, days=days)
    return ProfitSnapshot(**snap)


@router.post("/payments/collect", response_model=TransactionRead, status_code=201, dependencies=[require_permission("finance.manage")])
async def collect_payment(payload: CollectPaymentRequest, session: DbSession, auth: CurrentAuth) -> TransactionRead:
    tx = await FinanceService(session).collect_payment(
        org_id=auth.org_id,
        amount=payload.amount,
        provider=payload.provider,
        reference=payload.reference,
        description=payload.description,
    )
    return TransactionRead.model_validate(tx)
