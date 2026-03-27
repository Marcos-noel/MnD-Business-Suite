from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.models.tenancy.organization import Organization


class OrganizationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, org_id: str) -> Organization:
        res = await self.session.execute(select(Organization).where(Organization.id == org_id))
        org = res.scalar_one_or_none()
        if org is None:
            raise NotFoundError("Organization not found")
        return org

    async def get_by_slug(self, slug: str) -> Organization:
        res = await self.session.execute(select(Organization).where(Organization.slug == slug))
        org = res.scalar_one_or_none()
        if org is None:
            raise NotFoundError("Organization not found")
        return org

    async def create(self, org: Organization) -> Organization:
        self.session.add(org)
        await self.session.commit()
        await self.session.refresh(org)
        return org
