from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.export_mgmt.shipment import Shipment
from app.repositories.tenant_base import TenantRepository


class ShipmentRepository(TenantRepository[Shipment]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Shipment)

