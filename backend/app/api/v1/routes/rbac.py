from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_permission
from app.core.deps import DbSession
from app.schemas.rbac import (
    AssignRoleRequest,
    GrantPermissionRequest,
    PermissionRead,
    RoleCreate,
    RoleRead,
)
from app.services.auth.rbac_admin_service import RbacAdminService


router = APIRouter()


@router.get("/roles", response_model=list[RoleRead], dependencies=[require_permission("rbac.manage")])
async def list_roles(session: DbSession, auth: CurrentAuth) -> list[RoleRead]:
    roles = await RbacAdminService(session).list_roles(org_id=auth.org_id)
    return [RoleRead.model_validate(r) for r in roles]


@router.post("/roles", response_model=RoleRead, status_code=201, dependencies=[require_permission("rbac.manage")])
async def create_role(payload: RoleCreate, session: DbSession, auth: CurrentAuth) -> RoleRead:
    role = await RbacAdminService(session).create_role(org_id=auth.org_id, name=payload.name, description=payload.description)
    return RoleRead.model_validate(role)


@router.get("/permissions", response_model=list[PermissionRead], dependencies=[require_permission("rbac.manage")])
async def list_permissions(session: DbSession) -> list[PermissionRead]:
    perms = await RbacAdminService(session).list_permissions()
    return [PermissionRead.model_validate(p) for p in perms]


@router.post("/grant", status_code=200, dependencies=[require_permission("rbac.manage")])
async def grant_permission(payload: GrantPermissionRequest, session: DbSession, auth: CurrentAuth) -> None:
    await RbacAdminService(session).grant_permission(
        org_id=auth.org_id, role_id=payload.role_id, permission_code=payload.permission_code
    )


@router.post("/assign", status_code=200, dependencies=[require_permission("rbac.manage")])
async def assign_role(payload: AssignRoleRequest, session: DbSession, auth: CurrentAuth) -> None:
    await RbacAdminService(session).assign_role(org_id=auth.org_id, user_id=payload.user_id, role_id=payload.role_id)

