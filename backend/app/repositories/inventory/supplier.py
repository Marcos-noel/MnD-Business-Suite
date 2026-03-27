from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory.supplier import Supplier
from app.repositories.tenant_base import TenantRepository


class SupplierRepository(TenantRepository[Supplier]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Supplier)

