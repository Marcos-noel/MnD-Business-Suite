from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth.permission import Permission


class PermissionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_all(self) -> list[Permission]:
        res = await self.session.execute(select(Permission).order_by(Permission.code.asc()))
        return list(res.scalars().all())

    async def get_by_code(self, code: str) -> Permission | None:
        res = await self.session.execute(select(Permission).where(Permission.code == code))
        return res.scalar_one_or_none()

    async def create(self, perm: Permission) -> Permission:
        self.session.add(perm)
        await self.session.commit()
        await self.session.refresh(perm)
        return perm

