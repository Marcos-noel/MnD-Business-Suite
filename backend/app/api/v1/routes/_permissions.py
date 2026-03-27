from __future__ import annotations

from collections.abc import Callable

from fastapi import Depends

from app.api.v1.routes._auth_deps import CurrentAuth
from app.core.deps import DbSession
from app.services.auth.rbac_service import RbacService
from app.services.tenancy.module_service import ModuleService, permission_to_module


def require_permission(permission: str) -> Callable:
    async def _dep(session: DbSession, auth: CurrentAuth) -> None:
        await RbacService(session).require_permission(user_id=auth.user_id, org_id=auth.org_id, permission=permission)
        module = permission_to_module(permission)
        if module:
            await ModuleService(session).require_module_enabled(org_id=auth.org_id, module_code=module)

    return Depends(_dep)


def require_any_permission(*permissions: str) -> Callable:
    perms = [p for p in permissions if p]
    if not perms:
        raise ValueError("require_any_permission requires at least one permission")

    async def _dep(session: DbSession, auth: CurrentAuth) -> None:
        user_perms = await RbacService(session).get_user_permissions(user_id=auth.user_id, org_id=auth.org_id)
        if not any(p in user_perms for p in perms):
            # Keep error message consistent.
            await RbacService(session).require_permission(user_id=auth.user_id, org_id=auth.org_id, permission=perms[0])
        # If any permission passes, still ensure the underlying module is enabled.
        module = None
        for p in perms:
            if p in user_perms:
                module = permission_to_module(p)
                break
        if module:
            await ModuleService(session).require_module_enabled(org_id=auth.org_id, module_code=module)

    return Depends(_dep)
