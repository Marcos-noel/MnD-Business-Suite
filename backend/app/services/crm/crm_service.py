from __future__ import annotations

import json
from datetime import datetime, timezone

from sqlalchemy import select

from app.models.auth.audit_event import AuditEvent
from app.models.crm.customer import Customer
from app.models.crm.interaction import InteractionLog
from app.models.crm.opportunity import Opportunity
from app.models.crm.quote import Quote, QuoteLine
from app.models.crm.quote_email import QuoteEmailLog
from app.models.crm.social_touchpoint import SocialTouchpoint
from app.models.commerce.order import CommerceOrder
from app.repositories.auth.audit_event import AuditEventRepository
from app.repositories.crm.customer import CustomerRepository
from app.repositories.crm.interaction import InteractionRepository
from app.repositories.crm.opportunity import OpportunityRepository
from app.repositories.crm.quote import QuoteLineRepository, QuoteRepository
from app.repositories.crm.quote_email import QuoteEmailLogRepository
from app.repositories.crm.social_touchpoint import SocialTouchpointRepository
from app.services.crm.email_tracking_service import QuoteEmailProvider
from app.services.crm.social_provider import SocialProviderAdapter
from app.services.base import BaseService


class CrmService(BaseService):
    async def create_customer(self, *, org_id: str, actor_user_id: str, data: dict) -> Customer:
        customer = Customer(org_id=org_id, **data)
        created = await CustomerRepository(self.session).create(customer)
        await self._audit(
            org_id=org_id,
            actor_user_id=actor_user_id,
            entity_type="customer",
            entity_id=created.id,
            action="create",
            summary=f"Customer created: {created.name}",
            after_data=data,
        )
        await self.publish("crm.customer_created", {"org_id": org_id, "customer_id": created.id})
        return created

    async def list_customers(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[Customer]:
        return await CustomerRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def update_customer(self, *, org_id: str, actor_user_id: str, customer_id: str, data: dict) -> Customer:
        repo = CustomerRepository(self.session)
        customer = await repo.get(org_id=org_id, id=customer_id)
        before = {"name": customer.name, "email": customer.email, "phone": customer.phone, "notes": customer.notes}
        updated = await repo.update(customer, data)
        await self._audit(
            org_id=org_id,
            actor_user_id=actor_user_id,
            entity_type="customer",
            entity_id=updated.id,
            action="update",
            summary=f"Customer updated: {updated.name}",
            before_data=before,
            after_data=data,
        )
        await self.publish("crm.customer_updated", {"org_id": org_id, "customer_id": updated.id})
        return updated

    async def create_opportunity(self, *, org_id: str, actor_user_id: str, data: dict) -> Opportunity:
        opp = Opportunity(org_id=org_id, **data)
        created = await OpportunityRepository(self.session).create(opp)
        await self._audit(
            org_id=org_id,
            actor_user_id=actor_user_id,
            entity_type="opportunity",
            entity_id=created.id,
            action="create",
            summary=f"Opportunity created: {created.title}",
            after_data=data,
        )
        await self.publish("crm.opportunity_created", {"org_id": org_id, "opportunity_id": created.id})
        return created

    async def list_opportunities(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[Opportunity]:
        return await OpportunityRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def update_opportunity(self, *, org_id: str, actor_user_id: str, opportunity_id: str, data: dict) -> Opportunity:
        repo = OpportunityRepository(self.session)
        opp = await repo.get(org_id=org_id, id=opportunity_id)
        before = {"title": opp.title, "stage": opp.stage, "value": float(opp.value)}
        updated = await repo.update(opp, data)
        await self._audit(
            org_id=org_id,
            actor_user_id=actor_user_id,
            entity_type="opportunity",
            entity_id=updated.id,
            action="update",
            summary=f"Opportunity updated: {updated.title}",
            before_data=before,
            after_data=data,
        )
        await self.publish("crm.opportunity_updated", {"org_id": org_id, "opportunity_id": updated.id})
        return updated

    async def log_interaction(self, *, org_id: str, actor_user_id: str, data: dict) -> InteractionLog:
        log = InteractionLog(org_id=org_id, **data)
        created = await InteractionRepository(self.session).create(log)
        await self._audit(
            org_id=org_id,
            actor_user_id=actor_user_id,
            entity_type="interaction",
            entity_id=created.id,
            action="create",
            summary=f"Interaction logged on {created.channel}",
            after_data=data,
        )
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

    async def create_quote(self, *, org_id: str, actor_user_id: str, data: dict) -> Quote:
        lines_data = data.pop("lines", [])
        seq = int(datetime.now(timezone.utc).timestamp())
        quote = Quote(
            org_id=org_id,
            quote_no=f"Q-{seq}",
            subtotal=0,
            total=0,
            **data,
        )
        created = await QuoteRepository(self.session).create(quote)

        subtotal = 0.0
        line_repo = QuoteLineRepository(self.session)
        for line in lines_data:
            line_total = float(line["quantity"]) * float(line["unit_price"])
            subtotal += line_total
            await line_repo.create(
                QuoteLine(
                    org_id=org_id,
                    quote_id=created.id,
                    item_name=line["item_name"],
                    quantity=line["quantity"],
                    unit_price=line["unit_price"],
                    line_total=line_total,
                )
            )
        tax = float(data.get("tax", 0) or 0)
        discount = float(data.get("discount", 0) or 0)
        await QuoteRepository(self.session).update(
            created,
            {"subtotal": subtotal, "total": max(subtotal + tax - discount, 0)},
        )
        await self._audit(
            org_id=org_id,
            actor_user_id=actor_user_id,
            entity_type="quote",
            entity_id=created.id,
            action="create",
            summary=f"Quote created: {created.quote_no}",
            after_data=data,
        )
        await self.publish("crm.quote_created", {"org_id": org_id, "quote_id": created.id})
        return created

    async def list_quotes(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[Quote]:
        return await QuoteRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def update_quote_status(self, *, org_id: str, actor_user_id: str, quote_id: str, status: str) -> Quote:
        repo = QuoteRepository(self.session)
        quote = await repo.get(org_id=org_id, id=quote_id)
        before = {"status": quote.status}
        updated = await repo.update(quote, {"status": status})
        await self._audit(
            org_id=org_id,
            actor_user_id=actor_user_id,
            entity_type="quote",
            entity_id=updated.id,
            action="status_update",
            summary=f"Quote status updated to {status}",
            before_data=before,
            after_data={"status": status},
        )
        await self.publish("crm.quote_status_updated", {"org_id": org_id, "quote_id": quote_id, "status": status})
        return updated

    async def list_quote_lines(self, *, org_id: str, quote_id: str) -> list[QuoteLine]:
        res = await self.session.execute(
            select(QuoteLine).where(QuoteLine.org_id == org_id).where(QuoteLine.quote_id == quote_id)
        )
        return list(res.scalars().all())

    async def create_social_touchpoint(self, *, org_id: str, actor_user_id: str, data: dict) -> SocialTouchpoint:
        touchpoint = SocialTouchpoint(org_id=org_id, **data)
        created = await SocialTouchpointRepository(self.session).create(touchpoint)
        await self._audit(
            org_id=org_id,
            actor_user_id=actor_user_id,
            entity_type="social_touchpoint",
            entity_id=created.id,
            action="create",
            summary=f"Social touchpoint on {created.platform}",
            after_data=data,
        )
        await self.publish("crm.social_touchpoint_created", {"org_id": org_id, "touchpoint_id": created.id})
        return created

    async def list_social_touchpoints(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[SocialTouchpoint]:
        return await SocialTouchpointRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def send_quote_email(
        self,
        *,
        org_id: str,
        actor_user_id: str,
        quote_id: str,
        to_email: str,
        subject: str,
        message: str,
    ) -> QuoteEmailLog:
        quote = await QuoteRepository(self.session).get(org_id=org_id, id=quote_id)
        provider_resp = await QuoteEmailProvider().send_quote_email(to_email=to_email, subject=subject, body=message)
        log = await QuoteEmailLogRepository(self.session).create(
            QuoteEmailLog(
                org_id=org_id,
                quote_id=quote.id,
                to_email=to_email.lower(),
                subject=subject,
                provider=provider_resp["provider"],
                provider_message_id=provider_resp["message_id"],
                status=provider_resp["status"],
            )
        )
        await QuoteRepository(self.session).update(quote, {"status": "sent"})
        await self._audit(
            org_id=org_id,
            actor_user_id=actor_user_id,
            entity_type="quote_email",
            entity_id=log.id,
            action="send",
            summary=f"Quote email sent to {to_email}",
            after_data={"quote_id": quote_id, "to_email": to_email, "subject": subject},
        )
        await self.publish("crm.quote_email_sent", {"org_id": org_id, "quote_id": quote_id, "email_log_id": log.id})
        return log

    async def list_quote_email_logs(self, *, org_id: str, quote_id: str) -> list[QuoteEmailLog]:
        res = await self.session.execute(
            select(QuoteEmailLog)
            .where(QuoteEmailLog.org_id == org_id)
            .where(QuoteEmailLog.quote_id == quote_id)
            .order_by(QuoteEmailLog.sent_at.desc())
        )
        return list(res.scalars().all())

    async def dispatch_social_message(
        self,
        *,
        org_id: str,
        actor_user_id: str,
        customer_id: str,
        platform: str,
        recipient: str,
        message: str,
    ) -> SocialTouchpoint:
        provider_resp = await SocialProviderAdapter().dispatch_message(platform=platform, recipient=recipient, message=message)
        touchpoint = await SocialTouchpointRepository(self.session).create(
            SocialTouchpoint(
                org_id=org_id,
                customer_id=customer_id,
                platform=platform,
                direction="outbound",
                external_message_id=provider_resp["external_message_id"],
                status="sent",
                content_preview=message[:500],
            )
        )
        await self._audit(
            org_id=org_id,
            actor_user_id=actor_user_id,
            entity_type="social_dispatch",
            entity_id=touchpoint.id,
            action="send",
            summary=f"{platform} message dispatched to {recipient}",
            after_data={"customer_id": customer_id, "platform": platform, "recipient": recipient},
        )
        await self.publish("crm.social_touchpoint_created", {"org_id": org_id, "touchpoint_id": touchpoint.id})
        return touchpoint

    async def list_audit_events(self, *, org_id: str, limit: int = 100, offset: int = 0) -> list[AuditEvent]:
        res = await self.session.execute(
            select(AuditEvent)
            .where(AuditEvent.org_id == org_id)
            .where(AuditEvent.module == "crm")
            .order_by(AuditEvent.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(res.scalars().all())

    async def _audit(
        self,
        *,
        org_id: str,
        actor_user_id: str,
        entity_type: str,
        entity_id: str,
        action: str,
        summary: str,
        before_data: dict | None = None,
        after_data: dict | None = None,
    ) -> None:
        payload = AuditEvent(
            org_id=org_id,
            actor_user_id=actor_user_id,
            module="crm",
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            summary=summary,
            before_json=json.dumps(before_data or {}),
            after_json=json.dumps(after_data or {}),
        )
        await AuditEventRepository(self.session).create(payload)
