from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tenancy.org_module import OrgModule


class OrgModuleRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self, *, org_id: str) -> list[OrgModule]:
        res = await self.session.execute(select(OrgModule).where(OrgModule.org_id == org_id).order_by(OrgModule.module_code.asc()))
        return list(res.scalars().all())

    async def get(self, *, org_id: str, module_code: str) -> OrgModule | None:
        res = await self.session.execute(
            select(OrgModule).where(OrgModule.org_id == org_id).where(OrgModule.module_code == module_code)
        )
        return res.scalar_one_or_none()

    async def upsert(self, *, org_id: str, module_code: str, data: dict) -> OrgModule:
        row = await self.get(org_id=org_id, module_code=module_code)
        if row is None:
            row = OrgModule(org_id=org_id, module_code=module_code, **data)
            self.session.add(row)
            await self.session.commit()
            await self.session.refresh(row)
            return row

        for k, v in data.items():
            setattr(row, k, v)
        await self.session.commit()
        await self.session.refresh(row)
        return row

