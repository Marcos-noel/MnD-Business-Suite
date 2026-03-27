from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_permission
from app.core.deps import DbSession
from app.schemas.analytics.overview import AnalyticsOverview
from app.services.analytics.analytics_service import AnalyticsService


router = APIRouter()


@router.get("/overview", response_model=AnalyticsOverview, dependencies=[require_permission("analytics.read")])
async def overview(session: DbSession, auth: CurrentAuth, days: int = 30) -> AnalyticsOverview:
    data = await AnalyticsService(session).overview(org_id=auth.org_id, days=days)
    return AnalyticsOverview(**data)

