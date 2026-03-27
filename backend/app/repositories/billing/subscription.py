from __future__ import annotations

from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.billing.subscription import (
    BillingInterval,
    Invoice,
    Plan,
    PlanTier,
    PlanType,
    PaymentMethod,
    Subscription,
    SubscriptionItem,
    SubscriptionStatus,
)
from app.repositories.tenant_base import TenantRepository


class SubscriptionRepository(TenantRepository):
    """Repository for subscription operations."""

    def __init__(self, session: AsyncSession, org_id: str | None = None):
        super().__init__(session, Subscription)
        self._org_id = org_id

    async def get_by_org(self, org_id: str) -> Subscription | None:
        """Get the active subscription for an organization."""
        stmt = (
            select(Subscription)
            .where(Subscription.org_id == org_id)
            .where(Subscription.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]))
            .order_by(Subscription.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_stripe_sub(self, stripe_sub_id: str) -> Subscription | None:
        """Get subscription by Stripe subscription ID."""
        stmt = select(Subscription).where(Subscription.stripe_subscription_id == stripe_sub_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


class SubscriptionItemRepository(TenantRepository):
    """Repository for subscription items."""

    def __init__(self, session: AsyncSession, org_id: str | None = None):
        super().__init__(session, SubscriptionItem)
        self._org_id = org_id

    async def get_by_subscription(self, subscription_id: str) -> list[SubscriptionItem]:
        """Get all items for a subscription."""
        stmt = select(SubscriptionItem).where(SubscriptionItem.subscription_id == subscription_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_app(self, subscription_id: str, app_code: str) -> SubscriptionItem | None:
        """Get subscription item for specific app."""
        stmt = select(SubscriptionItem).where(
            SubscriptionItem.subscription_id == subscription_id,
            SubscriptionItem.app_code == app_code,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


class InvoiceRepository(TenantRepository):
    """Repository for invoice operations."""

    def __init__(self, session: AsyncSession, org_id: str | None = None):
        super().__init__(session, Invoice)
        self._org_id = org_id

    async def get_by_stripe_id(self, stripe_invoice_id: str) -> Invoice | None:
        """Get invoice by Stripe ID."""
        stmt = select(Invoice).where(Invoice.stripe_invoice_id == stripe_invoice_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_pending(self) -> list[Invoice]:
        """Get all pending invoices."""
        stmt = select(Invoice).where(Invoice.status == "open")
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def generate_invoice_number(self) -> str:
        """Generate unique invoice number."""
        from app.models.base import generate_uuid
        today = datetime.utcnow().strftime("%Y%m%d")
        short_id = generate_uuid()[:8].upper()
        return f"INV-{today}-{short_id}"


class PaymentMethodRepository(TenantRepository):
    """Repository for payment method operations."""

    def __init__(self, session: AsyncSession, org_id: str | None = None):
        super().__init__(session, PaymentMethod)
        self._org_id = org_id

    async def get_by_stripe_id(self, stripe_pm_id: str) -> PaymentMethod | None:
        """Get payment method by Stripe ID."""
        stmt = select(PaymentMethod).where(PaymentMethod.stripe_payment_method_id == stripe_pm_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_default(self, org_id: str) -> PaymentMethod | None:
        """Get default payment method for org."""
        stmt = select(PaymentMethod).where(
            PaymentMethod.org_id == org_id,
            PaymentMethod.is_default.is_(True),
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def set_default(self, org_id: str, payment_method_id: str) -> None:
        """Set a payment method as default."""
        stmt = select(PaymentMethod).where(PaymentMethod.org_id == org_id)
        result = await self.session.execute(stmt)
        for pm in result.scalars().all():
            pm.is_default = False

        stmt = select(PaymentMethod).where(PaymentMethod.id == payment_method_id)
        result = await self.session.execute(stmt)
        pm = result.scalar_one_or_none()
        if pm:
            pm.is_default = True


class PlanRepository(TenantRepository):
    """Repository for plan operations."""

    def __init__(self, session: AsyncSession, org_id: str | None = None):
        super().__init__(session, Plan)
        self._org_id = org_id

    async def get_by_price_id(self, stripe_price_id: str) -> Plan | None:
        """Get plan by Stripe price ID."""
        stmt = select(Plan).where(Plan.stripe_price_id == stripe_price_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_active(self) -> list[Plan]:
        """List all active plans."""
        stmt = select(Plan).where(Plan.is_active.is_(True)).order_by(Plan.price_amount)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_plan(self, plan_type: PlanType, tier: PlanTier, interval: BillingInterval) -> Plan | None:
        """Get specific plan by type, tier and interval."""
        stmt = select(Plan).where(
            Plan.plan_type == plan_type,
            Plan.plan_tier == tier,
            Plan.billing_interval == interval,
            Plan.is_active.is_(True),
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


from datetime import datetime