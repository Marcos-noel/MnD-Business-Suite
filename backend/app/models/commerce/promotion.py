from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class Promotion(TenantScopedBase):
    """Discount codes and promotions for e-commerce"""
    __tablename__ = "com_promotions"

    org_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True
    )
    
    # Code configuration
    code: Mapped[str] = mapped_column(String(50), index=True)
    description: Mapped[str] = mapped_column(String(500), default="")
    
    # Discount type and value
    discount_type: Mapped[str] = mapped_column(String(20), default="percentage")  # percentage, fixed
    discount_value: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    
    # Constraints
    min_order_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    max_uses: Mapped[int] = mapped_column(Integer, default=0)  # 0 = unlimited
    used_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Per-user limit
    max_uses_per_user: Mapped[int] = mapped_column(Integer, default=1)
    
    # Validity
    starts_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Apply to specific products/categories (optional)
    applicable_products: Mapped[str] = mapped_column(String(1000), default="")  # comma-separated IDs
    applicable_categories: Mapped[str] = mapped_column(String(1000), default="")  # comma-separated IDs


class PromotionUsage(TenantScopedBase):
    """Track usage of promotions by users"""
    __tablename__ = "com_promotion_usages"

    org_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True
    )
    
    promotion_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("com_promotions.id", ondelete="CASCADE"), index=True
    )
    user_email: Mapped[str] = mapped_column(String(255), default="")
    order_id: Mapped[str] = mapped_column(String(36), default="")
    discount_applied: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    used_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
