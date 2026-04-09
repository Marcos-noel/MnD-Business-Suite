from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import Response

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


# ============ Promotions / Discount Codes ============

from datetime import datetime
from pydantic import BaseModel
from fastapi import HTTPException
from sqlalchemy import select, func
from app.models.commerce.promotion import Promotion


class PromotionCreate(BaseModel):
    code: str
    description: str = ""
    discount_type: str = "percentage"  # percentage, fixed
    discount_value: float
    min_order_amount: float = 0
    max_uses: int = 0  # 0 = unlimited
    max_uses_per_user: int = 1
    starts_at: str | None = None
    expires_at: str | None = None
    is_active: bool = True


class PromotionUpdate(BaseModel):
    description: str | None = None
    discount_type: str | None = None
    discount_value: float | None = None
    min_order_amount: float | None = None
    max_uses: int | None = None
    max_uses_per_user: int | None = None
    starts_at: str | None = None
    expires_at: str | None = None
    is_active: bool | None = None


class PromotionRead(BaseModel):
    id: str
    code: str
    description: str
    discount_type: str
    discount_value: float
    min_order_amount: float
    max_uses: int
    used_count: int
    max_uses_per_user: int
    starts_at: str
    expires_at: str | None
    is_active: bool


@router.get(
    "/promotions",
    response_model=list[PromotionRead],
    dependencies=[require_permission("commerce.manage")],
)
async def list_promotions(session: DbSession, auth: CurrentAuth) -> list[PromotionRead]:
    result = await session.execute(
        select(Promotion)
        .where(Promotion.org_id == auth.org_id)
        .order_by(Promotion.created_at.desc())
    )
    return [PromotionRead(
        id=p.id,
        code=p.code,
        description=p.description,
        discount_type=p.discount_type,
        discount_value=float(p.discount_value),
        min_order_amount=float(p.min_order_amount),
        max_uses=p.max_uses,
        used_count=p.used_count,
        max_uses_per_user=p.max_uses_per_user,
        starts_at=p.starts_at.isoformat() if p.starts_at else "",
        expires_at=p.expires_at.isoformat() if p.expires_at else None,
        is_active=p.is_active,
    ) for p in result.scalars().all()]


@router.post(
    "/promotions",
    response_model=PromotionRead,
    status_code=201,
    dependencies=[require_permission("commerce.manage")],
)
async def create_promotion(payload: PromotionCreate, session: DbSession, auth: CurrentAuth) -> PromotionRead:
    # Check for duplicate code
    existing = await session.execute(
        select(Promotion).where(
            Promotion.org_id == auth.org_id,
            Promotion.code == payload.code.upper()
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Promotion code already exists")
    
    promo = Promotion(
        org_id=auth.org_id,
        code=payload.code.upper(),
        description=payload.description,
        discount_type=payload.discount_type,
        discount_value=payload.discount_value,
        min_order_amount=payload.min_order_amount,
        max_uses=payload.max_uses,
        max_uses_per_user=payload.max_uses_per_user,
        starts_at=datetime.fromisoformat(payload.starts_at) if payload.starts_at else datetime.utcnow(),
        expires_at=datetime.fromisoformat(payload.expires_at) if payload.expires_at else None,
        is_active=payload.is_active,
    )
    session.add(promo)
    await session.commit()
    await session.refresh(promo)
    
    return PromotionRead(
        id=promo.id,
        code=promo.code,
        description=promo.description,
        discount_type=promo.discount_type,
        discount_value=float(promo.discount_value),
        min_order_amount=float(promo.min_order_amount),
        max_uses=promo.max_uses,
        used_count=promo.used_count,
        max_uses_per_user=promo.max_uses_per_user,
        starts_at=promo.starts_at.isoformat() if promo.starts_at else "",
        expires_at=promo.expires_at.isoformat() if promo.expires_at else None,
        is_active=promo.is_active,
    )


@router.get(
    "/promotions/{promo_id}",
    response_model=PromotionRead,
    dependencies=[require_permission("commerce.manage")],
)
async def get_promotion(promo_id: str, session: DbSession, auth: CurrentAuth) -> PromotionRead:
    promo = await session.get(Promotion, promo_id)
    if not promo or promo.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    return PromotionRead(
        id=promo.id,
        code=promo.code,
        description=promo.description,
        discount_type=promo.discount_type,
        discount_value=float(promo.discount_value),
        min_order_amount=float(promo.min_order_amount),
        max_uses=promo.max_uses,
        used_count=promo.used_count,
        max_uses_per_user=promo.max_uses_per_user,
        starts_at=promo.starts_at.isoformat() if promo.starts_at else "",
        expires_at=promo.expires_at.isoformat() if promo.expires_at else None,
        is_active=promo.is_active,
    )


@router.patch(
    "/promotions/{promo_id}",
    response_model=PromotionRead,
    dependencies=[require_permission("commerce.manage")],
)
async def update_promotion(promo_id: str, payload: PromotionUpdate, session: DbSession, auth: CurrentAuth) -> PromotionRead:
    promo = await session.get(Promotion, promo_id)
    if not promo or promo.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    if payload.description is not None:
        promo.description = payload.description
    if payload.discount_type is not None:
        promo.discount_type = payload.discount_type
    if payload.discount_value is not None:
        promo.discount_value = payload.discount_value
    if payload.min_order_amount is not None:
        promo.min_order_amount = payload.min_order_amount
    if payload.max_uses is not None:
        promo.max_uses = payload.max_uses
    if payload.max_uses_per_user is not None:
        promo.max_uses_per_user = payload.max_uses_per_user
    if payload.starts_at is not None:
        promo.starts_at = datetime.fromisoformat(payload.starts_at)
    if payload.expires_at is not None:
        promo.expires_at = datetime.fromisoformat(payload.expires_at)
    if payload.is_active is not None:
        promo.is_active = payload.is_active
    
    await session.commit()
    await session.refresh(promo)
    
    return PromotionRead(
        id=promo.id,
        code=promo.code,
        description=promo.description,
        discount_type=promo.discount_type,
        discount_value=float(promo.discount_value),
        min_order_amount=float(promo.min_order_amount),
        max_uses=promo.max_uses,
        used_count=promo.used_count,
        max_uses_per_user=promo.max_uses_per_user,
        starts_at=promo.starts_at.isoformat() if promo.starts_at else "",
        expires_at=promo.expires_at.isoformat() if promo.expires_at else None,
        is_active=promo.is_active,
    )


@router.delete(
    "/promotions/{promo_id}",
    status_code=204,
    dependencies=[require_permission("commerce.manage")],
    response_class=Response,
)
async def delete_promotion(promo_id: str, session: DbSession, auth: CurrentAuth) -> Response:
    promo = await session.get(Promotion, promo_id)
    if not promo or promo.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    await session.delete(promo)
    await session.commit()
    return Response(status_code=204)


# ============ Validate Discount Code (Storefront) ============

class ValidatePromoRequest(BaseModel):
    code: str
    order_amount: float


class ValidatePromoResponse(BaseModel):
    valid: bool
    discount_type: str | None = None
    discount_value: float | None = None
    discount_amount: float = 0
    final_amount: float = 0
    message: str | None = None


@router.post("/validate-promo", response_model=ValidatePromoResponse)
async def validate_promocode(payload: ValidatePromoRequest, org_slug: str, session: DbSession) -> ValidatePromoResponse:
    """Validate a discount code for storefront checkout"""
    from app.repositories.tenancy.organization import OrganizationRepository
    
    org = await OrganizationRepository(session).get_by_slug(org_slug)
    if not org:
        raise HTTPException(status_code=404, detail="Store not found")
    
    result = await session.execute(
        select(Promotion).where(
            Promotion.org_id == org.id,
            Promotion.code == payload.code.upper()
        )
    )
    promo = result.scalar_one_or_none()
    
    if not promo:
        return ValidatePromoResponse(
            valid=False,
            message="Invalid discount code",
        )
    
    now = datetime.utcnow()
    
    # Check if active
    if not promo.is_active:
        return ValidatePromoResponse(
            valid=False,
            message="This discount code is no longer active",
        )
    
    # Check expiration
    if promo.expires_at and now > promo.expires_at:
        return ValidatePromoResponse(
            valid=False,
            message="This discount code has expired",
        )
    
    # Check start date
    if promo.starts_at and now < promo.starts_at:
        return ValidatePromoResponse(
            valid=False,
            message="This discount code is not yet active",
        )
    
    # Check usage limits
    if promo.max_uses > 0 and promo.used_count >= promo.max_uses:
        return ValidatePromoResponse(
            valid=False,
            message="This discount code has reached its usage limit",
        )
    
    # Check minimum order amount
    if payload.order_amount < promo.min_order_amount:
        return ValidatePromoResponse(
            valid=False,
            message=f"Minimum order amount of {promo.min_order_amount} required",
        )
    
    # Calculate discount
    if promo.discount_type == "percentage":
        discount_amount = payload.order_amount * (promo.discount_value / 100)
    else:  # fixed
        discount_amount = min(promo.discount_value, payload.order_amount)
    
    final_amount = payload.order_amount - discount_amount
    
    return ValidatePromoResponse(
        valid=True,
        discount_type=promo.discount_type,
        discount_value=float(promo.discount_value),
        discount_amount=discount_amount,
        final_amount=final_amount,
        message="Discount applied successfully",
    )
