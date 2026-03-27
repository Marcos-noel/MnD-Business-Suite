from __future__ import annotations

from app.core.errors import AppError
from app.models.auth.role import Role
from app.repositories.auth.permission import PermissionRepository
from app.repositories.auth.rbac import RbacRepository
from app.repositories.auth.role import RoleRepository
from app.repositories.auth.user import UserRepository
from app.services.base import BaseService


class RbacAdminService(BaseService):
    async def list_roles(self, *, org_id: str) -> list[Role]:
        return await RoleRepository(self.session).list_by_org(org_id)

    async def create_role(self, *, org_id: str, name: str, description: str) -> Role:
        repo = RoleRepository(self.session)
        existing = await repo.get_by_name(org_id=org_id, name=name)
        if existing is not None:
            raise AppError("Role already exists", status_code=409, code="conflict")
        role = await repo.create(Role(org_id=org_id, name=name, description=description))
        await self.publish("rbac.role_created", {"org_id": org_id, "role_id": role.id})
        return role

    async def list_permissions(self) -> list:
        return await PermissionRepository(self.session).list_all()

    async def grant_permission(self, *, org_id: str, role_id: str, permission_code: str) -> None:
        role = await RoleRepository(self.session).get(org_id=org_id, role_id=role_id)
        if role is None:
            raise AppError("Role not found", status_code=404, code="not_found")
        perm = await PermissionRepository(self.session).get_by_code(permission_code)
        if perm is None:
            raise AppError("Permission not found", status_code=404, code="not_found")
        await RbacRepository(self.session).grant_permission_to_role(role_id=role_id, permission_id=perm.id)
        await self.publish("rbac.permission_granted", {"org_id": org_id, "role_id": role_id, "perm": permission_code})

    async def assign_role(self, *, org_id: str, user_id: str, role_id: str) -> None:
        # Ensure user belongs to org (isolation)
        await UserRepository(self.session).get(org_id=org_id, user_id=user_id)
        role = await RoleRepository(self.session).get(org_id=org_id, role_id=role_id)
        if role is None:
            raise AppError("Role not found", status_code=404, code="not_found")
        await RbacRepository(self.session).assign_role_to_user(user_id=user_id, role_id=role_id)
        await self.publish("rbac.role_assigned", {"org_id": org_id, "user_id": user_id, "role_id": role_id})

