from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class BillingInterval(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"


class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    TRIALING = "trialing"
    INCOMPLETE = "incomplete"


class PlanType(str, Enum):
    INDIVIDUAL = "individual"
    SUITE = "suite"


class PlanTier(str, Enum):
    STARTER = "starter"
    STANDARD = "standard"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class Subscription(BaseModel):
    """Organization subscription to a billing plan."""
    __tablename__ = "subscriptions"

    org_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True
    )
    stripe_customer_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    stripe_price_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    plan_type: Mapped[PlanType] = mapped_column(SQLEnum(PlanType), default=PlanType.INDIVIDUAL)
    plan_tier: Mapped[PlanTier] = mapped_column(SQLEnum(PlanTier), default=PlanTier.STANDARD)
    billing_interval: Mapped[BillingInterval] = mapped_column(SQLEnum(BillingInterval), default=BillingInterval.MONTHLY)
    status: Mapped[SubscriptionStatus] = mapped_column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.TRIALING)
    current_period_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    current_period_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    trial_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    canceled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end: Mapped[bool] = mapped_column(default=False)


class SubscriptionItem(BaseModel):
    """Individual app subscriptions within a suite or standalone."""
    __tablename__ = "subscription_items"

    subscription_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("subscriptions.id", ondelete="CASCADE"), index=True
    )
    app_code: Mapped[str] = mapped_column(String(50), index=True)  # hr, crm, finance, etc.
    stripe_price_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    plan_tier: Mapped[PlanTier] = mapped_column(SQLEnum(PlanTier), default=PlanTier.STANDARD)
    is_active: Mapped[bool] = mapped_column(default=True)


class Invoice(BaseModel):
    """Billing invoices for organizations."""
    __tablename__ = "invoices"

    org_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True
    )
    subscription_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True
    )
    stripe_invoice_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True)
    amount_due: Mapped[int] = mapped_column(default=0)  # in cents
    amount_paid: Mapped[int] = mapped_column(default=0)
    amount_remaining: Mapped[int] = mapped_column(default=0)
    currency: Mapped[str] = mapped_column(String(3), default="usd")
    status: Mapped[str] = mapped_column(String(30), default="draft")  # draft, open, paid, void
    invoice_pdf: Mapped[str | None] = mapped_column(String(500), nullable=True)
    hosted_invoice_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class PaymentMethod(BaseModel):
    """Stored payment methods for organizations."""
    __tablename__ = "payment_methods"

    org_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True
    )
    stripe_payment_method_id: Mapped[str] = mapped_column(String(100), unique=True)
    stripe_customer_id: Mapped[str] = mapped_column(String(100))
    payment_type: Mapped[str] = mapped_column(String(30))  # card, bank_account, etc.
    card_brand: Mapped[str | None] = mapped_column(String(20), nullable=True)
    card_last4: Mapped[str | None] = mapped_column(String(4), nullable=True)
    card_exp_month: Mapped[int | None] = mapped_column(nullable=True)
    card_exp_year: Mapped[int | None] = mapped_column(nullable=True)
    is_default: Mapped[bool] = mapped_column(default=False)
    is_valid: Mapped[bool] = mapped_column(default=True)


class Plan(BaseModel):
    """Available subscription plans configuration."""
    __tablename__ = "plans"

    plan_type: Mapped[PlanType] = mapped_column(SQLEnum(PlanType))
    plan_tier: Mapped[PlanTier] = mapped_column(SQLEnum(PlanTier))
    billing_interval: Mapped[BillingInterval] = mapped_column(SQLEnum(BillingInterval))
    stripe_price_id: Mapped[str] = mapped_column(String(100), unique=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price_amount: Mapped[int] = mapped_column(default=0)  # in cents
    currency: Mapped[str] = mapped_column(String(3), default="usd")
    features: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string of features
    max_users: Mapped[int | None] = mapped_column(nullable=True)
    max_storage_gb: Mapped[int | None] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    apps_included: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array of app codes
