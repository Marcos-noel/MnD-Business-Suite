from __future__ import annotations

import asyncio
from collections.abc import AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_permission
from app.core.realtime import realtime_broker
from app.core.deps import DbSession
from app.schemas.auth.audit import AuditEventRead
from app.schemas.crm.customer import CustomerCreate, CustomerOrderSummary, CustomerRead, CustomerUpdate
from app.schemas.crm.email import QuoteEmailLogRead, QuoteEmailSendRequest
from app.schemas.crm.interaction import InteractionCreate, InteractionRead
from app.schemas.crm.opportunity import OpportunityCreate, OpportunityRead, OpportunityUpdate
from app.schemas.crm.quote import QuoteCreate, QuoteLineRead, QuoteRead, QuoteStatusUpdate
from app.schemas.crm.social_dispatch import SocialDispatchRequest
from app.schemas.crm.social_touchpoint import SocialTouchpointCreate, SocialTouchpointRead
from app.services.crm.crm_service import CrmService


router = APIRouter()


@router.get("/customers", response_model=list[CustomerRead], dependencies=[require_permission("crm.manage")])
async def list_customers(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[CustomerRead]:
    items = await CrmService(session).list_customers(org_id=auth.org_id, limit=limit, offset=offset)
    return [CustomerRead.model_validate(i) for i in items]


@router.post("/customers", response_model=CustomerRead, status_code=201, dependencies=[require_permission("crm.manage")])
async def create_customer(payload: CustomerCreate, session: DbSession, auth: CurrentAuth) -> CustomerRead:
    customer = await CrmService(session).create_customer(org_id=auth.org_id, actor_user_id=auth.user_id, data=payload.model_dump())
    return CustomerRead.model_validate(customer)


@router.patch("/customers/{customer_id}", response_model=CustomerRead, dependencies=[require_permission("crm.manage")])
async def update_customer(customer_id: str, payload: CustomerUpdate, session: DbSession, auth: CurrentAuth) -> CustomerRead:
    customer = await CrmService(session).update_customer(
        org_id=auth.org_id, actor_user_id=auth.user_id, customer_id=customer_id, data=payload.model_dump()
    )
    return CustomerRead.model_validate(customer)


@router.get("/opportunities", response_model=list[OpportunityRead], dependencies=[require_permission("crm.manage")])
async def list_opportunities(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[OpportunityRead]:
    items = await CrmService(session).list_opportunities(org_id=auth.org_id, limit=limit, offset=offset)
    return [OpportunityRead.model_validate(i) for i in items]


@router.post("/opportunities", response_model=OpportunityRead, status_code=201, dependencies=[require_permission("crm.manage")])
async def create_opportunity(payload: OpportunityCreate, session: DbSession, auth: CurrentAuth) -> OpportunityRead:
    opp = await CrmService(session).create_opportunity(org_id=auth.org_id, actor_user_id=auth.user_id, data=payload.model_dump())
    return OpportunityRead.model_validate(opp)


@router.patch("/opportunities/{opportunity_id}", response_model=OpportunityRead, dependencies=[require_permission("crm.manage")])
async def update_opportunity(opportunity_id: str, payload: OpportunityUpdate, session: DbSession, auth: CurrentAuth) -> OpportunityRead:
    opp = await CrmService(session).update_opportunity(
        org_id=auth.org_id, actor_user_id=auth.user_id, opportunity_id=opportunity_id, data=payload.model_dump()
    )
    return OpportunityRead.model_validate(opp)


@router.get("/interactions", response_model=list[InteractionRead], dependencies=[require_permission("crm.manage")])
async def list_interactions(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[InteractionRead]:
    items = await CrmService(session).list_interactions(org_id=auth.org_id, limit=limit, offset=offset)
    return [InteractionRead.model_validate(i) for i in items]


@router.post("/interactions", response_model=InteractionRead, status_code=201, dependencies=[require_permission("crm.manage")])
async def create_interaction(payload: InteractionCreate, session: DbSession, auth: CurrentAuth) -> InteractionRead:
    log = await CrmService(session).log_interaction(org_id=auth.org_id, actor_user_id=auth.user_id, data=payload.model_dump())
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


@router.get("/quotes", response_model=list[QuoteRead], dependencies=[require_permission("crm.quote.manage")])
async def list_quotes(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[QuoteRead]:
    svc = CrmService(session)
    quotes = await svc.list_quotes(org_id=auth.org_id, limit=limit, offset=offset)
    response: list[QuoteRead] = []
    for q in quotes:
        lines = await svc.list_quote_lines(org_id=auth.org_id, quote_id=q.id)
        response.append(
            QuoteRead.model_validate(
                {
                    **q.__dict__,
                    "subtotal": float(q.subtotal),
                    "tax": float(q.tax),
                    "discount": float(q.discount),
                    "total": float(q.total),
                    "lines": [
                        {
                            **ln.__dict__,
                            "quantity": float(ln.quantity),
                            "unit_price": float(ln.unit_price),
                            "line_total": float(ln.line_total),
                        }
                        for ln in lines
                    ],
                }
            )
        )
    return response


@router.post("/quotes", response_model=QuoteRead, status_code=201, dependencies=[require_permission("crm.quote.manage")])
async def create_quote(payload: QuoteCreate, session: DbSession, auth: CurrentAuth) -> QuoteRead:
    svc = CrmService(session)
    quote = await svc.create_quote(org_id=auth.org_id, actor_user_id=auth.user_id, data=payload.model_dump())
    lines = await svc.list_quote_lines(org_id=auth.org_id, quote_id=quote.id)
    return QuoteRead.model_validate(
        {
            **quote.__dict__,
            "subtotal": float(quote.subtotal),
            "tax": float(quote.tax),
            "discount": float(quote.discount),
            "total": float(quote.total),
            "lines": [QuoteLineRead.model_validate({**ln.__dict__, "quantity": float(ln.quantity), "unit_price": float(ln.unit_price), "line_total": float(ln.line_total)}) for ln in lines],
        }
    )


@router.patch("/quotes/{quote_id}/status", response_model=QuoteRead, dependencies=[require_permission("crm.quote.manage")])
async def update_quote_status(quote_id: str, payload: QuoteStatusUpdate, session: DbSession, auth: CurrentAuth) -> QuoteRead:
    svc = CrmService(session)
    quote = await svc.update_quote_status(
        org_id=auth.org_id,
        actor_user_id=auth.user_id,
        quote_id=quote_id,
        status=payload.status,
    )
    lines = await svc.list_quote_lines(org_id=auth.org_id, quote_id=quote.id)
    return QuoteRead.model_validate(
        {
            **quote.__dict__,
            "subtotal": float(quote.subtotal),
            "tax": float(quote.tax),
            "discount": float(quote.discount),
            "total": float(quote.total),
            "lines": [QuoteLineRead.model_validate({**ln.__dict__, "quantity": float(ln.quantity), "unit_price": float(ln.unit_price), "line_total": float(ln.line_total)}) for ln in lines],
        }
    )


@router.get("/social-touchpoints", response_model=list[SocialTouchpointRead], dependencies=[require_permission("crm.social.manage")])
async def list_social_touchpoints(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[SocialTouchpointRead]:
    items = await CrmService(session).list_social_touchpoints(org_id=auth.org_id, limit=limit, offset=offset)
    return [SocialTouchpointRead.model_validate(i) for i in items]


@router.post("/social-touchpoints", response_model=SocialTouchpointRead, status_code=201, dependencies=[require_permission("crm.social.manage")])
async def create_social_touchpoint(payload: SocialTouchpointCreate, session: DbSession, auth: CurrentAuth) -> SocialTouchpointRead:
    item = await CrmService(session).create_social_touchpoint(
        org_id=auth.org_id, actor_user_id=auth.user_id, data=payload.model_dump()
    )
    return SocialTouchpointRead.model_validate(item)


@router.get("/audit-feed", response_model=list[AuditEventRead], dependencies=[require_permission("crm.activity.read")])
async def list_audit_feed(session: DbSession, auth: CurrentAuth, limit: int = 100, offset: int = 0) -> list[AuditEventRead]:
    items = await CrmService(session).list_audit_events(org_id=auth.org_id, limit=limit, offset=offset)
    return [AuditEventRead.model_validate(i) for i in items]


@router.post("/quotes/{quote_id}/send-email", response_model=QuoteEmailLogRead, dependencies=[require_permission("crm.quote.manage")])
async def send_quote_email(quote_id: str, payload: QuoteEmailSendRequest, session: DbSession, auth: CurrentAuth) -> QuoteEmailLogRead:
    log = await CrmService(session).send_quote_email(
        org_id=auth.org_id,
        actor_user_id=auth.user_id,
        quote_id=quote_id,
        to_email=payload.to_email,
        subject=payload.subject,
        message=payload.message,
    )
    return QuoteEmailLogRead.model_validate(log)


@router.get("/quotes/{quote_id}/emails", response_model=list[QuoteEmailLogRead], dependencies=[require_permission("crm.quote.manage")])
async def list_quote_emails(quote_id: str, session: DbSession, auth: CurrentAuth) -> list[QuoteEmailLogRead]:
    logs = await CrmService(session).list_quote_email_logs(org_id=auth.org_id, quote_id=quote_id)
    return [QuoteEmailLogRead.model_validate(i) for i in logs]


@router.post("/social-dispatch", response_model=SocialTouchpointRead, status_code=201, dependencies=[require_permission("crm.social.manage")])
async def dispatch_social(payload: SocialDispatchRequest, session: DbSession, auth: CurrentAuth) -> SocialTouchpointRead:
    item = await CrmService(session).dispatch_social_message(
        org_id=auth.org_id,
        actor_user_id=auth.user_id,
        customer_id=payload.customer_id,
        platform=payload.platform,
        recipient=payload.recipient,
        message=payload.message,
    )
    return SocialTouchpointRead.model_validate(item)


@router.get("/stream", dependencies=[require_permission("crm.activity.read")])
async def crm_stream(auth: CurrentAuth) -> StreamingResponse:
    async def event_generator() -> AsyncGenerator[str, None]:
        queue = await realtime_broker.subscribe()
        try:
            yield "event: ready\ndata: {\"status\":\"connected\"}\n\n"
            while True:
                event = await queue.get()
                if event.payload.get("org_id") != auth.org_id:
                    continue
                yield event.to_sse()
        finally:
            await realtime_broker.unsubscribe(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
