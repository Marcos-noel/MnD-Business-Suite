from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routes import (
    analytics,
    assistant,
    auth,
    billing,
    commerce,
    crm,
    erp,
    export_mgmt,
    finance,
    health,
    hr,
    inventory,
    marketing,
    rbac,
    storefront,
)


api_router_v1 = APIRouter()
api_router_v1.include_router(health.router, tags=["health"])
api_router_v1.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router_v1.include_router(rbac.router, prefix="/rbac", tags=["rbac"])
api_router_v1.include_router(erp.router, prefix="/erp", tags=["erp"])
api_router_v1.include_router(hr.router, prefix="/hr", tags=["hr"])
api_router_v1.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router_v1.include_router(crm.router, prefix="/crm", tags=["crm"])
api_router_v1.include_router(commerce.router, prefix="/commerce", tags=["commerce"])
api_router_v1.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router_v1.include_router(finance.router, prefix="/finance", tags=["finance"])
api_router_v1.include_router(export_mgmt.router, prefix="/exports", tags=["exports"])
api_router_v1.include_router(assistant.router, prefix="/assistant", tags=["assistant"])
api_router_v1.include_router(billing.router, prefix="/billing", tags=["billing"])
api_router_v1.include_router(storefront.router, tags=["storefront"])
api_router_v1.include_router(marketing.router, tags=["marketing"])
