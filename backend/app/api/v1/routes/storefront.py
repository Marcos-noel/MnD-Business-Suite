from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.core.deps import DbSession
from app.repositories.tenancy.organization import OrganizationRepository
from app.schemas.commerce.order import StorefrontCheckoutRequest, StorefrontProductRead
from app.services.commerce.commerce_service import CommerceService


router = APIRouter()


@router.get("/store/{org_slug}/products", response_model=list[StorefrontProductRead])
async def products(org_slug: str, session: DbSession, limit: int = 50, offset: int = 0) -> list[StorefrontProductRead]:
    try:
        org = await OrganizationRepository(session).get_by_slug(org_slug)
        if not org:
            # Return empty list for non-existent orgs instead of error
            return []
        items = await CommerceService(session).list_storefront_products(org_id=org.id, limit=limit, offset=offset)
        return [
            StorefrontProductRead(
                id=p.id,
                sku=p.sku,
                name=p.name,
                description=p.description,
                image_url=p.image_url,
                sell_price=float(p.sell_price),
                currency=p.currency,
            )
            for p in items
        ]
    except Exception as e:
        # Return empty list instead of 500 error
        return []


@router.post("/store/{org_slug}/checkout", status_code=201)
async def checkout(org_slug: str, payload: StorefrontCheckoutRequest, session: DbSession) -> dict:
    try:
        org = await OrganizationRepository(session).get_by_slug(org_slug)
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        return await CommerceService(session).storefront_checkout(
            org_id=org.id,
            customer_name=payload.customer_name,
            customer_email=str(payload.customer_email),
            items=[i.model_dump() for i in payload.items],
            provider=payload.provider,
            reference=payload.reference,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

