"""
Billing API routes for subscription management.
"""

from __future__ import annotations

from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_permission
from app.core.config import settings
from app.core.deps import DbSession
from app.models.billing.subscription import (
    BillingInterval,
    PlanTier,
    PlanType,
    SubscriptionStatus,
)
from app.services.billing.stripe_service import StripeBillingService, SubscriptionService


router = APIRouter(prefix="/billing", tags=["billing"])


# Pydantic schemas
class CreateCheckoutRequest(BaseModel):
    plan_type: PlanType
    plan_tier: PlanTier
    billing_interval: BillingInterval


class CheckoutResponse(BaseModel):
    checkout_url: str


class PortalResponse(BaseModel):
    portal_url: str


class SubscriptionResponse(BaseModel):
    id: str
    status: SubscriptionStatus
    plan_type: PlanType
    plan_tier: PlanTier
    billing_interval: BillingInterval
    current_period_start: str | None
    current_period_end: str | None
    cancel_at_period_end: bool


class ChangePlanRequest(BaseModel):
    plan_tier: PlanTier
    billing_interval: BillingInterval


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    payload: CreateCheckoutRequest,
    session: DbSession,
    auth: CurrentAuth,
):
    """Create a Stripe checkout session for subscription."""
    service = SubscriptionService(session)
    sub_service = StripeBillingService()

    # Get plan
    from app.repositories.billing.subscription import PlanRepository
    plan_repo = PlanRepository(session)
    plan = await plan_repo.get_plan(
        payload.plan_type, payload.plan_tier, payload.billing_interval
    )
    if not plan:
        raise ValueError("Plan not found")

    # Get or create customer
    from app.repositories.tenancy.organization import OrganizationRepository
    org_repo = OrganizationRepository(session)
    org = await org_repo.get(auth.org_id, auth.org_id)

    from app.repositories.auth.user import UserRepository
    user_repo = UserRepository(session)
    user = await user_repo.get(auth.org_id, auth.user_id)

    customer_id = None  # Would get from subscription if exists

    checkout = await sub_service.create_checkout_session(
        customer_id=customer_id or "",
        price_id=plan.stripe_price_id,
        org_id=auth.org_id,
        success_url=f"{settings.frontend_url}/billing/success",
        cancel_url=f"{settings.frontend_url}/billing/cancel",
    )

    return CheckoutResponse(checkout_url=checkout.url)


@router.get("/portal", response_model=PortalResponse)
async def customer_portal(
    session: DbSession,
    auth: CurrentAuth,
):
    """Create a Stripe Customer Portal session."""
    sub_service = StripeBillingService()
    service = SubscriptionService(session)

    subscription = await service.get_org_subscription(auth.org_id)
    if not subscription or not subscription.stripe_customer_id:
        raise ValueError("No subscription found")

    portal = await sub_service.create_customer_portal_session(
        customer_id=subscription.stripe_customer_id,
        return_url=f"{settings.frontend_url}/settings/billing",
    )

    return PortalResponse(portal_url=portal.url)


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    session: DbSession,
    auth: CurrentAuth,
):
    """Get current subscription details."""
    service = SubscriptionService(session)
    sub = await service.get_org_subscription(auth.org_id)

    if not sub:
        return SubscriptionResponse(
            id="",
            status=SubscriptionStatus.TRIALING,
            plan_type=PlanType.INDIVIDUAL,
            plan_tier=PlanTier.STANDARD,
            billing_interval=BillingInterval.MONTHLY,
            current_period_start=None,
            current_period_end=None,
            cancel_at_period_end=False,
        )

    return SubscriptionResponse(
        id=sub.id,
        status=sub.status,
        plan_type=sub.plan_type,
        plan_tier=sub.plan_tier,
        billing_interval=sub.billing_interval,
        current_period_start=sub.current_period_start.isoformat() if sub.current_period_start else None,
        current_period_end=sub.current_period_end.isoformat() if sub.current_period_end else None,
        cancel_at_period_end=sub.cancel_at_period_end,
    )


@router.post("/cancel")
async def cancel_subscription(
    immediate: bool = False,
    session: DbSession = None,
    auth: CurrentAuth = None,
):
    """Cancel the current subscription."""
    service = SubscriptionService(session)
    sub = await service.cancel_subscription(auth.org_id, immediate)
    return {"status": "canceled", "subscription_id": sub.id}


@router.post("/change-plan")
async def change_plan(
    payload: ChangePlanRequest,
    session: DbSession,
    auth: CurrentAuth,
):
    """Change subscription to a different plan."""
    service = SubscriptionService(session)
    sub = await service.change_plan(
        auth.org_id,
        payload.plan_tier,
        payload.billing_interval,
    )
    return {"status": "updated", "subscription_id": sub.id}


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")

    sub_service = StripeBillingService()

    try:
        event = await sub_service.construct_webhook_event(payload, signature)
    except ValueError as e:
        return {"error": "Invalid signature"}

    result = await sub_service.handle_webhook(event)
    return result
