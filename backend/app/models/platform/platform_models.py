from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text, Float, Integer, Boolean, DateTime, JSON, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.models.base import TenantScopedBase


class SubscriptionPlan(TenantScopedBase):
    """Subscription plans with features"""
    __tablename__ = "platform_subscription_plans"

    plan_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    tagline: Mapped[str] = mapped_column(String(255), default="")

    price_monthly: Mapped[float] = mapped_column(Float, default=0)
    price_yearly: Mapped[float] = mapped_column(Float, default=0)

    features: Mapped[str] = mapped_column(JSON, default="{}")  # JSON feature list with limits
    feature_limits: Mapped[str] = mapped_column(JSON, default="{}")  # Specific limits per feature

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    max_users: Mapped[int] = mapped_column(Integer, default=1)
    max_storage_gb: Mapped[int] = mapped_column(Integer, default=1)
    api_rate_limit: Mapped[int] = mapped_column(Integer, default=1000)  # requests per hour

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class OrganizationSubscription(TenantScopedBase):
    """Organization subscription records"""
    __tablename__ = "platform_organization_subscriptions"

    plan_id: Mapped[str] = mapped_column(String(50), index=True)

    status: Mapped[str] = mapped_column(String(50), default="active")  # active, cancelled, expired, past_due
    billing_cycle: Mapped[str] = mapped_column(String(20), default="monthly")  # monthly, yearly

    current_period_start: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    current_period_end: Mapped[datetime] = mapped_column(DateTime)
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, default=False)

    # Payment integration
    stripe_subscription_id: Mapped[str] = mapped_column(String(255), default="", index=True)
    stripe_customer_id: Mapped[str] = mapped_column(String(255), default="")
    stripe_price_id: Mapped[str] = mapped_column(String(255), default="")

    trial_start: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    trial_end: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FeatureUsage(TenantScopedBase):
    """Track feature usage against limits"""
    __tablename__ = "platform_feature_usage"

    feature_name: Mapped[str] = mapped_column(String(100), index=True)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    usage_limit: Mapped[int] = mapped_column(Integer, default=0)  # 0 = unlimited

    reset_period: Mapped[str] = mapped_column(String(20), default="monthly")  # daily, weekly, monthly, never
    last_reset: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    next_reset: Mapped[datetime] = mapped_column(DateTime)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Plugin(TenantScopedBase):
    """Installed plugins per organization"""
    __tablename__ = "platform_plugins"

    plugin_id: Mapped[str] = mapped_column(String(100), index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    version: Mapped[str] = mapped_column(String(20))

    author: Mapped[str] = mapped_column(String(255), default="")
    author_url: Mapped[str] = mapped_column(String(500), default="")
    plugin_url: Mapped[str] = mapped_column(String(500), default="")

    status: Mapped[str] = mapped_column(String(50), default="inactive")  # active, inactive, installed, error

    settings: Mapped[str] = mapped_column(JSON, default="{}")  # Plugin configuration
    permissions: Mapped[str] = mapped_column(JSON, default="[]")  # Required permissions

    installed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PluginMarketplace(TenantScopedBase):
    """Plugin marketplace catalog"""
    __tablename__ = "platform_plugin_marketplace"

    plugin_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(100), index=True)

    version: Mapped[str] = mapped_column(String(20))
    price: Mapped[float] = mapped_column(Float, default=0)  # 0 = free

    author: Mapped[str] = mapped_column(String(255))
    author_url: Mapped[str] = mapped_column(String(500), default="")
    plugin_url: Mapped[str] = mapped_column(String(500), default="")

    downloads: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Float, default=0)  # 1-5 stars
    reviews_count: Mapped[int] = mapped_column(Integer, default=0)

    tags: Mapped[str] = mapped_column(JSON, default="[]")  # Tag array
    screenshots: Mapped[str] = mapped_column(JSON, default="[]")  # Screenshot URLs

    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    min_plan: Mapped[str] = mapped_column(String(50), default="free")  # Minimum subscription required

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PluginHook(TenantScopedBase):
    """Plugin hooks system"""
    __tablename__ = "platform_plugin_hooks"

    plugin_id: Mapped[str] = mapped_column(String(100), index=True)
    hook_type: Mapped[str] = mapped_column(String(50))  # action, filter
    hook_name: Mapped[str] = mapped_column(String(255), index=True)

    callback_function: Mapped[str] = mapped_column(String(255))
    priority: Mapped[int] = mapped_column(Integer, default=10)

    parameters: Mapped[str] = mapped_column(JSON, default="[]")  # Expected parameters
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class ApiKey(TenantScopedBase):
    """API keys for developers"""
    __tablename__ = "platform_api_keys"

    key_name: Mapped[str] = mapped_column(String(255))
    key_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True)  # Hashed API key

    permissions: Mapped[str] = mapped_column(JSON, default="[]")  # API permissions
    rate_limit: Mapped[int] = mapped_column(Integer, default=1000)  # requests per hour

    last_used: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Integration(TenantScopedBase):
    """Third-party integrations"""
    __tablename__ = "platform_integrations"

    integration_type: Mapped[str] = mapped_column(String(100), index=True)  # erp, crm, shipping, payment
    provider: Mapped[str] = mapped_column(String(100), index=True)  # sap, salesforce, shopify, stripe

    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")

    config: Mapped[str] = mapped_column(JSON, default="{}")  # Encrypted credentials and settings
    settings: Mapped[str] = mapped_column(JSON, default="{}")  # User-configurable settings

    status: Mapped[str] = mapped_column(String(50), default="inactive")  # active, inactive, error, pending

    last_sync: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    sync_status: Mapped[str] = mapped_column(String(50), default="never")  # success, failed, in_progress

    error_message: Mapped[str] = mapped_column(Text, default="")
    retry_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AiInsight(TenantScopedBase):
    """AI-generated insights for flagship users"""
    __tablename__ = "platform_ai_insights"

    insight_type: Mapped[str] = mapped_column(String(100), index=True)  # sales_forecast, churn_prediction, inventory_opt
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")

    data: Mapped[str] = mapped_column(JSON, default="{}")  # Insight data and visualizations
    confidence_score: Mapped[float] = mapped_column(Float, default=0)  # 0-1 confidence level

    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)  # When to regenerate

    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    tags: Mapped[str] = mapped_column(JSON, default="[]")  # Categorization tags


class CustomDashboard(TenantScopedBase):
    """Custom dashboards for flagship users"""
    __tablename__ = "platform_custom_dashboards"

    dashboard_name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")

    config: Mapped[str] = mapped_column(JSON, default="{}")  # Dashboard configuration
    layout: Mapped[str] = mapped_column(JSON, default="{}")  # Widget layout

    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    created_by: Mapped[str] = mapped_column(String(36))  # User ID who created it
    shared_with: Mapped[str] = mapped_column(JSON, default="[]")  # User IDs with access

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Webhook(TenantScopedBase):
    """Webhook configurations"""
    __tablename__ = "platform_webhooks"

    webhook_url: Mapped[str] = mapped_column(String(500))
    secret: Mapped[str] = mapped_column(String(255))  # HMAC secret for verification

    events: Mapped[str] = mapped_column(JSON, default="[]")  # Events to listen for
    headers: Mapped[str] = mapped_column(JSON, default="{}")  # Custom headers

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=3)
    timeout_seconds: Mapped[int] = mapped_column(Integer, default=30)

    last_triggered: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    failure_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
