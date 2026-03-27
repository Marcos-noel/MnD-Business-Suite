from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth.role import Role


class RoleRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_by_org(self, org_id: str) -> list[Role]:
        res = await self.session.execute(select(Role).where(Role.org_id == org_id).order_by(Role.name.asc()))
        return list(res.scalars().all())

    async def get_by_name(self, *, org_id: str, name: str) -> Role | None:
        res = await self.session.execute(select(Role).where(Role.org_id == org_id).where(Role.name == name))
        return res.scalar_one_or_none()

    async def get(self, *, org_id: str, role_id: str) -> Role | None:
        res = await self.session.execute(select(Role).where(Role.org_id == org_id).where(Role.id == role_id))
        return res.scalar_one_or_none()

    async def create(self, role: Role) -> Role:
        self.session.add(role)
        await self.session.commit()
        await self.session.refresh(role)
        return role

