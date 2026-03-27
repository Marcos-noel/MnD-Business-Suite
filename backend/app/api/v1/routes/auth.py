from __future__ import annotations

from fastapi import APIRouter, Response

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_permission
from app.core.config import settings, should_use_secure_cookies
from app.core.deps import DbSession
from app.schemas.common import APIModel
from app.schemas.auth.auth import LoginRequest, RefreshRequest, RegisterOrgRequest
from app.schemas.auth.me import UserMeRead
from app.schemas.auth.token import TokenPair
from app.schemas.auth.user_admin import UserCreateRequest, UserRead
from app.schemas.tenancy.organization import OrganizationRead
from app.repositories.auth.rbac import RbacRepository
from app.repositories.auth.user import UserRepository
from app.services.auth.auth_service import AuthService
from app.services.auth.user_admin_service import UserAdminService
from app.repositories.tenancy.organization import OrganizationRepository
from app.services.tenancy.module_service import ModuleService
from app.core.errors import ForbiddenError


router = APIRouter()


@router.post("/register", response_model=OrganizationRead, status_code=201)
async def register_org(payload: RegisterOrgRequest, session: DbSession) -> OrganizationRead:
    if settings.environment.strip().lower() in {"prod", "production"} and not settings.allow_public_registration:
        raise ForbiddenError("Public registration is disabled")
    org = await AuthService(session).register_org_with_admin(
        org_name=payload.org_name,
        org_slug=payload.org_slug,
        admin_email=payload.admin_email,
        admin_full_name=payload.admin_full_name,
        admin_password=payload.admin_password,
    )
    return OrganizationRead.model_validate(org)


@router.post("/login", response_model=TokenPair)
async def login(payload: LoginRequest, session: DbSession, response: Response) -> TokenPair:
    _, access, refresh = await AuthService(session).login(
        org_slug=payload.org_slug, email=payload.email, password=payload.password
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh,
        httponly=True,
        secure=should_use_secure_cookies(),
        samesite=settings.cookie_samesite,
        max_age=60 * 60 * 24 * 14,
        path="/",
    )
    return TokenPair(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenPair)
async def refresh(payload: RefreshRequest, session: DbSession, response: Response) -> TokenPair:
    access, refresh_token = await AuthService(session).refresh(refresh_token=payload.refresh_token)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=should_use_secure_cookies(),
        samesite=settings.cookie_samesite,
        max_age=60 * 60 * 24 * 14,
        path="/",
    )
    return TokenPair(access_token=access, refresh_token=refresh_token)


@router.get("/users", response_model=list[UserRead], dependencies=[require_permission("users.manage")])
async def list_users(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[UserRead]:
    users = await UserAdminService(session).list_users(org_id=auth.org_id, limit=limit, offset=offset)
    return [UserRead.model_validate(u) for u in users]


@router.post("/users", response_model=UserRead, status_code=201, dependencies=[require_permission("users.manage")])
async def create_user(payload: UserCreateRequest, session: DbSession, auth: CurrentAuth) -> UserRead:
    user = await UserAdminService(session).create_user(
        org_id=auth.org_id,
        email=str(payload.email),
        full_name=payload.full_name,
        password=payload.password,
        role_name=payload.role_name,
        is_active=payload.is_active,
    )
    return UserRead.model_validate(user)


@router.get("/me", response_model=UserMeRead)
async def me(session: DbSession, auth: CurrentAuth) -> UserMeRead:
    org = await OrganizationRepository(session).get(auth.org_id)
    user = await UserRepository(session).get(org_id=auth.org_id, user_id=auth.user_id)
    roles = await RbacRepository(session).get_user_role_names(user_id=auth.user_id, org_id=auth.org_id)
    perms = await RbacRepository(session).get_user_permissions(user_id=auth.user_id, org_id=auth.org_id)
    modules = await ModuleService(session).list_modules(org_id=auth.org_id)
    enabled = sorted([m["module_code"] for m in modules if m["is_enabled"]])
    return UserMeRead(
        org_id=auth.org_id,
        org_name=org.name,
        org_slug=org.slug,
        org_logo_url=org.logo_url or "",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url or "",
        roles=roles,
        permissions=sorted(perms),
        enabled_modules=enabled,
    )


class UserUpdateRequest(APIModel):
    full_name: str | None = None
    avatar_url: str | None = None


@router.patch("/me", response_model=UserMeRead)
async def update_me(payload: UserUpdateRequest, session: DbSession, auth: CurrentAuth) -> UserMeRead:
    user = await UserRepository(session).get(org_id=auth.org_id, user_id=auth.user_id)
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.avatar_url is not None:
        user.avatar_url = payload.avatar_url
    await session.commit()
    await session.refresh(user)
    
    # Return updated user info
    org = await OrganizationRepository(session).get(auth.org_id)
    roles = await RbacRepository(session).get_user_role_names(user_id=auth.user_id, org_id=auth.org_id)
    perms = await RbacRepository(session).get_user_permissions(user_id=auth.user_id, org_id=auth.org_id)
    modules = await ModuleService(session).list_modules(org_id=auth.org_id)
    enabled = sorted([m["module_code"] for m in modules if m["is_enabled"]])
    return UserMeRead(
        org_id=auth.org_id,
        org_name=org.name,
        org_slug=org.slug,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url or "",
        roles=roles,
        permissions=sorted(perms),
        enabled_modules=enabled,
    )
