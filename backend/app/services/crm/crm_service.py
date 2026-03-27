from __future__ import annotations

from sqlalchemy import select

from app.models.crm.customer import Customer
from app.models.crm.interaction import InteractionLog
from app.models.crm.opportunity import Opportunity
from app.models.commerce.order import CommerceOrder
from app.repositories.crm.customer import CustomerRepository
from app.repositories.crm.interaction import InteractionRepository
from app.repositories.crm.opportunity import OpportunityRepository
from app.services.base import BaseService


class CrmService(BaseService):
    async def create_customer(self, *, org_id: str, data: dict) -> Customer:
        customer = Customer(org_id=org_id, **data)
        created = await CustomerRepository(self.session).create(customer)
        await self.publish("crm.customer_created", {"org_id": org_id, "customer_id": created.id})
        return created

    async def list_customers(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[Customer]:
        return await CustomerRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def update_customer(self, *, org_id: str, customer_id: str, data: dict) -> Customer:
        repo = CustomerRepository(self.session)
        customer = await repo.get(org_id=org_id, id=customer_id)
        updated = await repo.update(customer, data)
        await self.publish("crm.customer_updated", {"org_id": org_id, "customer_id": updated.id})
        return updated

    async def create_opportunity(self, *, org_id: str, data: dict) -> Opportunity:
        opp = Opportunity(org_id=org_id, **data)
        created = await OpportunityRepository(self.session).create(opp)
        await self.publish("crm.opportunity_created", {"org_id": org_id, "opportunity_id": created.id})
        return created

    async def list_opportunities(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[Opportunity]:
        return await OpportunityRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def update_opportunity(self, *, org_id: str, opportunity_id: str, data: dict) -> Opportunity:
        repo = OpportunityRepository(self.session)
        opp = await repo.get(org_id=org_id, id=opportunity_id)
        updated = await repo.update(opp, data)
        await self.publish("crm.opportunity_updated", {"org_id": org_id, "opportunity_id": updated.id})
        return updated

    async def log_interaction(self, *, org_id: str, data: dict) -> InteractionLog:
        log = InteractionLog(org_id=org_id, **data)
        created = await InteractionRepository(self.session).create(log)
        await self.publish("crm.interaction_logged", {"org_id": org_id, "interaction_id": created.id})
        return created

    async def list_interactions(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[InteractionLog]:
        return await InteractionRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def list_customer_orders(self, *, org_id: str, customer_id: str, limit: int = 50, offset: int = 0) -> list[CommerceOrder]:
        res = await self.session.execute(
            select(CommerceOrder)
            .where(CommerceOrder.org_id == org_id)
            .where(CommerceOrder.customer_id == customer_id)
            .order_by(CommerceOrder.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(res.scalars().all())
