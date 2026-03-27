from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth.permission import Permission
from app.models.auth.role_permission import RolePermission
from app.models.auth.user_role import UserRole


class RbacRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_role_names(self, *, user_id: str, org_id: str) -> list[str]:
        from app.models.auth.role import Role

        res = await self.session.execute(
            select(Role.name)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(UserRole.user_id == user_id)
            .where(Role.org_id == org_id)
        )
        return list(res.scalars().all())

    async def get_user_permissions(self, *, user_id: str, org_id: str) -> set[str]:
        from app.models.auth.role import Role

        res = await self.session.execute(
            select(Permission.code)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(Role, Role.id == RolePermission.role_id)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(UserRole.user_id == user_id)
            .where(Role.org_id == org_id)
        )
        return set(res.scalars().all())

    async def assign_role_to_user(self, *, user_id: str, role_id: str) -> None:
        self.session.add(UserRole(user_id=user_id, role_id=role_id))
        await self.session.commit()

    async def grant_permission_to_role(self, *, role_id: str, permission_id: str) -> None:
        self.session.add(RolePermission(role_id=role_id, permission_id=permission_id))
        await self.session.commit()

