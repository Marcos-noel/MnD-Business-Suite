from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory.stock_movement import StockMovement
from app.repositories.tenant_base import TenantRepository


class StockMovementRepository(TenantRepository[StockMovement]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, StockMovement)

