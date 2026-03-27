from __future__ import annotations

from app.core.errors import ForbiddenError
from app.repositories.auth.rbac import RbacRepository
from app.services.base import BaseService


class RbacService(BaseService):
    async def get_user_permissions(self, *, user_id: str, org_id: str) -> set[str]:
        return await RbacRepository(self.session).get_user_permissions(user_id=user_id, org_id=org_id)

    async def require_permission(self, *, user_id: str, org_id: str, permission: str) -> None:
        perms = await self.get_user_permissions(user_id=user_id, org_id=org_id)
        if permission not in perms:
            raise ForbiddenError("Insufficient permissions")
