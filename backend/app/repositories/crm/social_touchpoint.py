from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.crm.social_touchpoint import SocialTouchpoint
from app.repositories.tenant_base import TenantRepository


class SocialTouchpointRepository(TenantRepository[SocialTouchpoint]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, SocialTouchpoint)
