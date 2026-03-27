from __future__ import annotations

from fastapi import APIRouter
from fastapi_cache.decorator import cache

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_permission
from app.core.deps import DbSession
from app.schemas.erp.dashboard import DashboardKpis
from app.services.erp.erp_service import ErpService


router = APIRouter()


@router.get("/dashboard", response_model=DashboardKpis, dependencies=[require_permission("erp.read")])
@cache(expire=30)
async def dashboard(session: DbSession, auth: CurrentAuth) -> DashboardKpis:
    data = await ErpService(session).dashboard_kpis(org_id=auth.org_id)
    return DashboardKpis(**data)

