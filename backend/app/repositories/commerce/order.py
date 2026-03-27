from __future__ import annotations

from sqlalchemy import select

from app.models.commerce.order import CommerceOrder
from app.repositories.tenant_base import TenantRepository


class CommerceOrderRepository(TenantRepository[CommerceOrder]):
    def __init__(self, session):
        super().__init__(session, CommerceOrder)

    async def get_by_order_no(self, *, org_id: str, order_no: str) -> CommerceOrder | None:
        res = await self.session.execute(
            select(CommerceOrder).where(CommerceOrder.org_id == org_id).where(CommerceOrder.order_no == order_no)
        )
        return res.scalar_one_or_none()

