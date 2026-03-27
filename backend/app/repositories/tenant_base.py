from __future__ import annotations

from typing import Any, Generic, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError


ModelT = TypeVar("ModelT")


class TenantRepository(Generic[ModelT]):
    def __init__(self, session: AsyncSession, model: type[ModelT]):
        self.session = session
        self.model = model

    async def get(self, *, org_id: str, id: str) -> ModelT:
        res = await self.session.execute(select(self.model).where(self.model.id == id).where(self.model.org_id == org_id))
        obj = res.scalar_one_or_none()
        if obj is None:
            raise NotFoundError(f"{self.model.__name__} not found")
        return obj

    async def list(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[ModelT]:
        res = await self.session.execute(
            select(self.model).where(self.model.org_id == org_id).limit(limit).offset(offset)
        )
        return list(res.scalars().all())

    async def create(self, obj: ModelT) -> ModelT:
        self.session.add(obj)
        await self.session.commit()
        await self.session.refresh(obj)
        return obj

    async def update(self, obj: ModelT, data: dict[str, Any]) -> ModelT:
        for k, v in data.items():
            if v is not None:
                setattr(obj, k, v)
        await self.session.commit()
        await self.session.refresh(obj)
        return obj

    async def delete(self, obj: ModelT) -> None:
        await self.session.delete(obj)
        await self.session.commit()

