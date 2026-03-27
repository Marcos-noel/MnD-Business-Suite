from __future__ import annotations

from sqlalchemy import select

from app.models.commerce.order_item import CommerceOrderItem
from app.repositories.tenant_base import TenantRepository


class CommerceOrderItemRepository(TenantRepository[CommerceOrderItem]):
    def __init__(self, session):
        super().__init__(session, CommerceOrderItem)

    async def list_by_order(self, *, org_id: str, order_id: str) -> list[CommerceOrderItem]:
        res = await self.session.execute(
            select(CommerceOrderItem)
            .where(CommerceOrderItem.org_id == org_id)
            .where(CommerceOrderItem.order_id == order_id)
        )
        return list(res.scalars().all())

