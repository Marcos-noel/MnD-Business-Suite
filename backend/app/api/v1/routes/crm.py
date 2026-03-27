from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_permission
from app.core.deps import DbSession
from app.schemas.crm.customer import CustomerCreate, CustomerOrderSummary, CustomerRead, CustomerUpdate
from app.schemas.crm.interaction import InteractionCreate, InteractionRead
from app.schemas.crm.opportunity import OpportunityCreate, OpportunityRead, OpportunityUpdate
from app.services.crm.crm_service import CrmService


router = APIRouter()


@router.get("/customers", response_model=list[CustomerRead], dependencies=[require_permission("crm.manage")])
async def list_customers(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[CustomerRead]:
    items = await CrmService(session).list_customers(org_id=auth.org_id, limit=limit, offset=offset)
    return [CustomerRead.model_validate(i) for i in items]


@router.post("/customers", response_model=CustomerRead, status_code=201, dependencies=[require_permission("crm.manage")])
async def create_customer(payload: CustomerCreate, session: DbSession, auth: CurrentAuth) -> CustomerRead:
    customer = await CrmService(session).create_customer(org_id=auth.org_id, data=payload.model_dump())
    return CustomerRead.model_validate(customer)


@router.patch("/customers/{customer_id}", response_model=CustomerRead, dependencies=[require_permission("crm.manage")])
async def update_customer(customer_id: str, payload: CustomerUpdate, session: DbSession, auth: CurrentAuth) -> CustomerRead:
    customer = await CrmService(session).update_customer(org_id=auth.org_id, customer_id=customer_id, data=payload.model_dump())
    return CustomerRead.model_validate(customer)


@router.get("/opportunities", response_model=list[OpportunityRead], dependencies=[require_permission("crm.manage")])
async def list_opportunities(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[OpportunityRead]:
    items = await CrmService(session).list_opportunities(org_id=auth.org_id, limit=limit, offset=offset)
    return [OpportunityRead.model_validate(i) for i in items]


@router.post("/opportunities", response_model=OpportunityRead, status_code=201, dependencies=[require_permission("crm.manage")])
async def create_opportunity(payload: OpportunityCreate, session: DbSession, auth: CurrentAuth) -> OpportunityRead:
    opp = await CrmService(session).create_opportunity(org_id=auth.org_id, data=payload.model_dump())
    return OpportunityRead.model_validate(opp)


@router.patch("/opportunities/{opportunity_id}", response_model=OpportunityRead, dependencies=[require_permission("crm.manage")])
async def update_opportunity(opportunity_id: str, payload: OpportunityUpdate, session: DbSession, auth: CurrentAuth) -> OpportunityRead:
    opp = await CrmService(session).update_opportunity(org_id=auth.org_id, opportunity_id=opportunity_id, data=payload.model_dump())
    return OpportunityRead.model_validate(opp)


@router.get("/interactions", response_model=list[InteractionRead], dependencies=[require_permission("crm.manage")])
async def list_interactions(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[InteractionRead]:
    items = await CrmService(session).list_interactions(org_id=auth.org_id, limit=limit, offset=offset)
    return [InteractionRead.model_validate(i) for i in items]


@router.post("/interactions", response_model=InteractionRead, status_code=201, dependencies=[require_permission("crm.manage")])
async def create_interaction(payload: InteractionCreate, session: DbSession, auth: CurrentAuth) -> InteractionRead:
    log = await CrmService(session).log_interaction(org_id=auth.org_id, data=payload.model_dump())
    return InteractionRead.model_validate(log)


@router.get("/customers/{customer_id}/orders", response_model=list[CustomerOrderSummary], dependencies=[require_permission("crm.manage")])
async def customer_orders(
    customer_id: str, session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0
) -> list[CustomerOrderSummary]:
    orders = await CrmService(session).list_customer_orders(org_id=auth.org_id, customer_id=customer_id, limit=limit, offset=offset)
    return [
        CustomerOrderSummary(
            id=o.id,
            order_no=o.order_no,
            currency=o.currency,
            total=float(o.total),
            status=o.status,
            created_at=o.created_at,
        )
        for o in orders
    ]
