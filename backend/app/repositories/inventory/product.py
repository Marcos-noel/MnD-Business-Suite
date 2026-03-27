from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory.product import Product
from app.models.inventory.stock_movement import StockMovement
from app.repositories.tenant_base import TenantRepository


class ProductRepository(TenantRepository[Product]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Product)

    async def stock_on_hand(self, *, org_id: str, product_id: str) -> int:
        res = await self.session.execute(
            select(func.coalesce(func.sum(StockMovement.quantity_delta), 0))
            .where(StockMovement.org_id == org_id)
            .where(StockMovement.product_id == product_id)
        )
        return int(res.scalar_one())

    async def stock_levels(self, *, org_id: str, limit: int = 200) -> list[tuple[Product, int]]:
        res = await self.session.execute(
            select(
                Product,
                func.coalesce(func.sum(StockMovement.quantity_delta), 0).label("on_hand"),
            )
            .outerjoin(
                StockMovement,
                (StockMovement.product_id == Product.id) & (StockMovement.org_id == org_id),
            )
            .where(Product.org_id == org_id)
            .group_by(Product.id)
            .order_by(Product.name.asc())
            .limit(limit)
        )
        return [(row[0], int(row[1])) for row in res.all()]

