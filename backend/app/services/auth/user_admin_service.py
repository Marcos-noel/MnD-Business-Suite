from __future__ import annotations

from app.core.errors import AppError, NotFoundError
from app.core.security import hash_password
from app.models.auth.role import Role
from app.models.auth.user import User
from app.repositories.auth.rbac import RbacRepository
from app.repositories.auth.role import RoleRepository
from app.repositories.auth.user import UserRepository
from app.services.base import BaseService


class UserAdminService(BaseService):
    async def list_users(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[User]:
        return await UserRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def create_user(
        self, *, org_id: str, email: str, full_name: str, password: str, role_name: str, is_active: bool
    ) -> User:
        role_repo = RoleRepository(self.session)
        role = await role_repo.get_by_name(org_id=org_id, name=role_name)
        if role is None:
            role = await role_repo.create(Role(org_id=org_id, name=role_name, description=f"{role_name} role"))

        repo = UserRepository(self.session)
        try:
            await repo.get_by_email(org_id=org_id, email=email)
        except NotFoundError:
            pass
        else:
            raise AppError("User already exists", status_code=409, code="user_exists")

        user = await repo.create(
            User(
                org_id=org_id,
                email=email.lower(),
                full_name=full_name,
                password_hash=hash_password(password),
                is_active=is_active,
            )
        )
        await RbacRepository(self.session).assign_role_to_user(user_id=user.id, role_id=role.id)
        if role_name == "staff":
            from app.repositories.auth.permission import PermissionRepository

            perm_repo = PermissionRepository(self.session)
            perms = {p.code: p.id for p in await perm_repo.list_all()}
            for code in ["erp.read", "hr.self", "inventory.read"]:
                perm_id = perms.get(code)
                if not perm_id:
                    continue
                try:
                    await RbacRepository(self.session).grant_permission_to_role(role_id=role.id, permission_id=perm_id)
                except Exception:
                    continue
        await self.publish("auth.user_created", {"org_id": org_id, "user_id": user.id})
        return user
