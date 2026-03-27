from __future__ import annotations

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth.refresh_token import RefreshToken


class RefreshTokenRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, rt: RefreshToken) -> RefreshToken:
        self.session.add(rt)
        await self.session.commit()
        await self.session.refresh(rt)
        return rt

    async def get_valid(self, *, user_id: str, org_id: str, family: str, token_hash: str) -> RefreshToken | None:
        res = await self.session.execute(
            select(RefreshToken)
            .where(RefreshToken.user_id == user_id)
            .where(RefreshToken.org_id == org_id)
            .where(RefreshToken.family == family)
            .where(RefreshToken.token_hash == token_hash)
            .where(RefreshToken.revoked.is_(False))
        )
        return res.scalar_one_or_none()

    async def revoke_family(self, *, user_id: str, family: str) -> None:
        await self.session.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id)
            .where(RefreshToken.family == family)
            .values(revoked=True)
        )
        await self.session.commit()

