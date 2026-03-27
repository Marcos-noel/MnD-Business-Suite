from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.crm.customer import Customer
from app.repositories.tenant_base import TenantRepository


class CustomerRepository(TenantRepository[Customer]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Customer)

    async def get_by_email(self, *, org_id: str, email: str) -> Customer | None:
        res = await self.session.execute(
            select(Customer).where(Customer.org_id == org_id).where(Customer.email == email.lower())
        )
        return res.scalar_one_or_none()
