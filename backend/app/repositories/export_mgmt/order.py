from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.export_mgmt.export_order import ExportOrder
from app.repositories.tenant_base import TenantRepository


class ExportOrderRepository(TenantRepository[ExportOrder]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, ExportOrder)

