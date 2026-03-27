from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.models.auth.user import User


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, *, org_id: str, email: str) -> User:
        res = await self.session.execute(
            select(User).where(User.org_id == org_id).where(User.email == email.lower())
        )
        user = res.scalar_one_or_none()
        if user is None:
            raise NotFoundError("User not found")
        return user

    async def get(self, *, org_id: str, user_id: str) -> User:
        res = await self.session.execute(select(User).where(User.org_id == org_id).where(User.id == user_id))
        user = res.scalar_one_or_none()
        if user is None:
            raise NotFoundError("User not found")
        return user

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def list(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[User]:
        res = await self.session.execute(select(User).where(User.org_id == org_id).limit(limit).offset(offset))
        return list(res.scalars().all())
