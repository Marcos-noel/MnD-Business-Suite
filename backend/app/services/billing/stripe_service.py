"""
Stripe billing service for subscription management.
Handles Stripe API interactions, webhook processing, and subscription lifecycle.
"""

from __future__ import annotations

import stripe
from datetime import datetime, timezone
from typing import Any

from app.core.config import settings
from app.models.billing.subscription import (
    BillingInterval,
    Plan,
    PlanTier,
    PlanType,
    Subscription,
    SubscriptionStatus,
)
from app.repositories.billing.subscription import (
    PlanRepository,
    SubscriptionRepository,
)


class StripeBillingService:
    """Service for Stripe billing operations."""

    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        self.webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    async def create_customer(self, org_id: str, org_name: str, email: str) -> stripe.Customer:
        """Create a Stripe customer for an organization."""
        customer = stripe.Customer.create(
            metadata={"org_id": org_id},
            name=org_name,
            email=email,
        )
        return customer

    async def create_subscription(
        self,
        customer_id: str,
        price_id: str,
        org_id: str,
    ) -> stripe.Subscription:
        """Create a new subscription in Stripe."""
        subscription = stripe.Subscription.create(
            customer=customer_id,
            items=[{"price": price_id}],
            payment_behavior="default_incomplete",
            expand=["latest_invoice.payment_intent"],
            metadata={"org_id": org_id},
        )
        return subscription

    async def get_subscription(self, subscription_id: str) -> stripe.Subscription:
        """Retrieve a subscription from Stripe."""
        return stripe.Subscription.retrieve(subscription_id)

    async def cancel_subscription(
        self, subscription_id: str, cancel_at_period_end: bool = True
    ) -> stripe.Subscription:
        """Cancel a subscription (optionally at period end)."""
        return stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=cancel_at_period_end,
        )

    async def update_subscription(
        self, subscription_id: str, new_price_id: str
    ) -> stripe.Subscription:
        """Update subscription with a new price."""
        subscription = await self.get_subscription(subscription_id)
        item_id = subscription["items"]["data"][0].id
        return stripe.Subscription.modify(
            subscription_id,
            items=[{"id": item_id, "price": new_price_id}],
        )

    async def create_checkout_session(
        self,
        customer_id: str,
        price_id: str,
        org_id: str,
        success_url: str,
        cancel_url: str,
    ) -> stripe.checkout.Session:
        """Create a Stripe Checkout session for subscription."""
        session = stripe.checkout.Session.create(
            customer=customer_id,
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"org_id": org_id},
        )
        return session

    async def create_customer_portal_session(
        self, customer_id: str, return_url: str
    ) -> stripe.billing_portal.Session:
        """Create a Stripe Customer Portal session."""
        return stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )

    async def construct_webhook_event(
        self, payload: bytes, signature: str
    ) -> stripe.Event:
        """Construct and verify webhook event."""
        return stripe.Webhook.construct_event(
            payload, signature, self.webhook_secret
        )

    async def handle_webhook(
        self, event: stripe.Event
    ) -> dict[str, Any]:
        """Handle webhook events from Stripe."""
        event_type = event["type"]
        data = event["data"]["object"]

        handlers = {
            "customer.subscription.created": self._handle_subscription_created,
            "customer.subscription.updated": self._handle_subscription_updated,
            "customer.subscription.deleted": self._handle_subscription_deleted,
            "invoice.paid": self._handle_invoice_paid,
            "invoice.payment_failed": self._handle_invoice_payment_failed,
            "customer.subscription.trial_will_end": self._handle_trial_ending,
            "checkout.session.completed": self._handle_checkout_completed,
        }

        handler = handlers.get(event_type)
        if handler:
            return await handler(data)
        return {"status": "ignored", "event_type": event_type}

    async def _handle_subscription_created(
        self, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle new subscription created."""
        return {"status": "processed", "action": "subscription_created"}

    async def _handle_subscription_updated(
        self, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle subscription updates."""
        return {"status": "processed", "action": "subscription_updated"}

    async def _handle_subscription_deleted(
        self, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle subscription cancellation."""
        return {"status": "processed", "action": "subscription_deleted"}

    async def _handle_invoice_paid(self, data: dict[str, Any]) -> dict[str, Any]:
        """Handle successful invoice payment."""
        return {"status": "processed", "action": "invoice_paid"}

    async def _handle_invoice_payment_failed(
        self, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle failed invoice payment."""
        return {"status": "processed", "action": "invoice_payment_failed"}

    async def _handle_trial_ending(
        self, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle trial ending notification."""
        return {"status": "processed", "action": "trial_ending"}

    async def _handle_checkout_completed(
        self, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Handle checkout session completed."""
        return {"status": "processed", "action": "checkout_completed"}


class SubscriptionService:
    """High-level subscription management service."""

    def __init__(self, session):
        self.session = session
        self.stripe = StripeBillingService()
        self.sub_repo = SubscriptionRepository(session)
        self.plan_repo = PlanRepository(session)

    async def create_org_subscription(
        self,
        org_id: str,
        org_name: str,
        admin_email: str,
        plan_type: PlanType,
        plan_tier: PlanTier,
        billing_interval: BillingInterval,
    ) -> dict[str, Any]:
        """Create a new subscription for an organization."""
        plan = await self.plan_repo.get_plan(plan_type, plan_tier, billing_interval)
        if not plan:
            raise ValueError(f"Plan not found: {plan_type} {plan_tier} {billing_interval}")

        customer = await self.stripe.create_customer(
            org_id=org_id,
            org_name=org_name,
            email=admin_email,
        )

        stripe_sub = await self.stripe.create_subscription(
            customer_id=customer.id,
            price_id=plan.stripe_price_id,
            org_id=org_id,
        )

        subscription = Subscription(
            org_id=org_id,
            stripe_customer_id=customer.id,
            stripe_subscription_id=stripe_sub.id,
            stripe_price_id=plan.stripe_price_id,
            plan_type=plan_type,
            plan_tier=plan_tier,
            billing_interval=billing_interval,
            status=SubscriptionStatus.INCOMPLETE,
            current_period_start=datetime.now(timezone.utc),
        )
        await self.sub_repo.create(subscription)

        return {
            "subscription_id": subscription.id,
            "client_secret": stripe_sub.get("latest_invoice", {}).get(
                "payment_intent", {}
            ).get("client_secret"),
        }

    async def get_org_subscription(self, org_id: str) -> Subscription | None:
        """Get organization's current subscription."""
        return await self.sub_repo.get_by_org(org_id)

    async def cancel_subscription(
        self, org_id: str, immediate: bool = False
    ) -> Subscription:
        """Cancel organization's subscription."""
        sub = await self.sub_repo.get_by_org(org_id)
        if not sub or not sub.stripe_subscription_id:
            raise ValueError("No active subscription found")

        await self.stripe.cancel_subscription(
            sub.stripe_subscription_id,
            cancel_at_period_end=not immediate,
        )

        if immediate:
            sub.status = SubscriptionStatus.CANCELED
            sub.canceled_at = datetime.now(timezone.utc)
        else:
            sub.cancel_at_period_end = True

        await self.session.commit()
        return sub

    async def change_plan(
        self,
        org_id: str,
        new_plan_tier: PlanTier,
        new_billing_interval: BillingInterval,
    ) -> Subscription:
        """Change subscription to a new plan."""
        sub = await self.sub_repo.get_by_org(org_id)
        if not sub or not sub.stripe_subscription_id:
            raise ValueError("No active subscription found")

        plan = await self.plan_repo.get_plan(
            sub.plan_type, new_plan_tier, new_billing_interval
        )
        if not plan:
            raise ValueError("Plan not found")

        await self.stripe.update_subscription(
            sub.stripe_subscription_id,
            plan.stripe_price_id,
        )

        sub.stripe_price_id = plan.stripe_price_id
        sub.plan_tier = new_plan_tier
        sub.billing_interval = new_billing_interval
        await self.session.commit()
        return sub