from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_permission
from app.core.deps import DbSession
from app.schemas.assistant.chat import (
    AnalyticsResponse,
    ChatRequest,
    ChatResponse,
    ForecastResponse,
    RecommendationsResponse,
)
from app.services.assistant.assistant_service import AssistantService


router = APIRouter()


@router.post("/chat", response_model=ChatResponse, dependencies=[require_permission("assistant.use")])
async def chat(payload: ChatRequest, session: DbSession, auth: CurrentAuth) -> ChatResponse:
    reply = await AssistantService(session).chat(org_id=auth.org_id, user_id=auth.user_id, message=payload.message)
    return ChatResponse(reply=reply)


@router.get("/recommendations", response_model=RecommendationsResponse, dependencies=[require_permission("assistant.use")])
async def recommendations(session: DbSession, auth: CurrentAuth) -> RecommendationsResponse:
    recs = await AssistantService(session).recommendations(org_id=auth.org_id)
    return RecommendationsResponse(recommendations=recs)


@router.get("/forecast", response_model=ForecastResponse, dependencies=[require_permission("assistant.use")])
async def forecast(session: DbSession, auth: CurrentAuth) -> ForecastResponse:
    data = await AssistantService(session).forecast(org_id=auth.org_id)
    return ForecastResponse(**data)


@router.get("/analytics", response_model=AnalyticsResponse, dependencies=[require_permission("assistant.use")])
async def analytics(session: DbSession, auth: CurrentAuth) -> AnalyticsResponse:
    data = await AssistantService(session).analytics(org_id=auth.org_id)
    return AnalyticsResponse(**data)

