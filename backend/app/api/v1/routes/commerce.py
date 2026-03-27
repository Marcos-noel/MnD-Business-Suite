from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_permission
from app.core.deps import DbSession
from app.schemas.commerce.order import CommerceOrderCreate, CommerceOrderPayRequest, CommerceOrderRead
from app.services.commerce.commerce_service import CommerceService


router = APIRouter()


def _order_to_read(order, items) -> CommerceOrderRead:
    return CommerceOrderRead.model_validate(
        {
            "id": order.id,
            "created_at": order.created_at,
            "updated_at": order.updated_at,
            "org_id": order.org_id,
            "order_no": order.order_no,
            "customer_id": order.customer_id,
            "customer_name": order.customer_name,
            "customer_email": order.customer_email,
            "currency": order.currency,
            "subtotal": float(order.subtotal),
            "tax": float(order.tax),
            "shipping": float(order.shipping),
            "total": float(order.total),
            "status": order.status,
            "payment_status": order.payment_status,
            "payment_provider": order.payment_provider,
            "payment_reference": order.payment_reference,
            "items": [
                {
                    "id": i.id,
                    "created_at": i.created_at,
                    "updated_at": i.updated_at,
                    "org_id": i.org_id,
                    "order_id": i.order_id,
                    "product_id": i.product_id,
                    "product_name": i.product_name,
                    "quantity": i.quantity,
                    "unit_price": float(i.unit_price),
                    "line_total": float(i.line_total),
                }
                for i in items
            ],
        }
    )


@router.get("/orders", response_model=list[CommerceOrderRead], dependencies=[require_permission("commerce.manage")])
async def list_orders(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[CommerceOrderRead]:
    svc = CommerceService(session)
    orders = await svc.list_orders(org_id=auth.org_id, limit=limit, offset=offset)
    out: list[CommerceOrderRead] = []
    for o in orders:
        order, items = await svc.get_order(org_id=auth.org_id, order_id=o.id)
        out.append(_order_to_read(order, items))
    return out


@router.post("/orders", response_model=CommerceOrderRead, status_code=201, dependencies=[require_permission("commerce.manage")])
async def create_order(payload: CommerceOrderCreate, session: DbSession, auth: CurrentAuth) -> CommerceOrderRead:
    order, items = await CommerceService(session).create_order(org_id=auth.org_id, data=payload.model_dump())
    return _order_to_read(order, items)


@router.get("/orders/{order_id}", response_model=CommerceOrderRead, dependencies=[require_permission("commerce.manage")])
async def get_order(order_id: str, session: DbSession, auth: CurrentAuth) -> CommerceOrderRead:
    order, items = await CommerceService(session).get_order(org_id=auth.org_id, order_id=order_id)
    return _order_to_read(order, items)


@router.post("/orders/{order_id}/pay", status_code=200, dependencies=[require_permission("commerce.manage")])
async def pay_order(order_id: str, payload: CommerceOrderPayRequest, session: DbSession, auth: CurrentAuth) -> dict:
    return await CommerceService(session).pay_order(
        org_id=auth.org_id, order_id=order_id, provider=payload.provider, reference=payload.reference
    )
