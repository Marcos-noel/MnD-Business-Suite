from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_permission
from app.core.deps import DbSession
from app.schemas.tenancy.modules import OrgModuleRead, OrgModuleUpdate
from app.services.tenancy.module_service import ModuleService


router = APIRouter()


@router.get("/modules", response_model=list[OrgModuleRead], dependencies=[require_permission("rbac.manage")])
async def list_modules(session: DbSession, auth: CurrentAuth) -> list[OrgModuleRead]:
    rows = await ModuleService(session).list_modules(org_id=auth.org_id)
    return [OrgModuleRead(**r) for r in rows]


@router.patch("/modules/{module_code}", response_model=OrgModuleRead, dependencies=[require_permission("rbac.manage")])
async def update_module(module_code: str, payload: OrgModuleUpdate, session: DbSession, auth: CurrentAuth) -> OrgModuleRead:
    row = await ModuleService(session).set_enabled(org_id=auth.org_id, module_code=module_code, is_enabled=payload.is_enabled)
    return OrgModuleRead(**row)

