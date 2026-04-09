from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Numeric, String, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class ShippingZone(TenantScopedBase):
    """Shipping zones for delivery rates"""
    __tablename__ = "com_shipping_zones"

    org_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True
    )
    
    name: Mapped[str] = mapped_column(String(100))
    countries: Mapped[str] = mapped_column(String(500), default="")  # comma-separated ISO codes
    regions: Mapped[str] = mapped_column(String(500), default="")  # comma-separated regions
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(default=0)


class ShippingRate(TenantScopedBase):
    """Shipping rates within a zone"""
    __tablename__ = "com_shipping_rates"

    org_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True
    )
    zone_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("com_shipping_zones.id", ondelete="CASCADE"), index=True
    )
    
    name: Mapped[str] = mapped_column(String(100))  # e.g., "Standard Shipping", "Express"
    description: Mapped[str] = mapped_column(String(500), default="")
    
    price: Mapped[float] = mapped_column(Numeric(10, 2), default=0)  # Base price
    free_shipping_threshold: Mapped[float] = mapped_column(Numeric(10, 2), default=0)  # Free above this
    
    min_weight: Mapped[float] = mapped_column(Numeric(10, 2), default=0)  # kg
    max_weight: Mapped[float] = mapped_column(Numeric(10, 2), default=0)  # 0 = unlimited
    
    estimated_days_min: Mapped[int] = mapped_column(default=1)
    estimated_days_max: Mapped[int] = mapped_column(default=3)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(default=0)


class TaxRate(TenantScopedBase):
    """Tax rates for different regions"""
    __tablename__ = "com_tax_rates"

    org_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True
    )
    
    name: Mapped[str] = mapped_column(String(100))  # e.g., "VAT", "Sales Tax"
    country: Mapped[str] = mapped_column(String(3), default="KEN")  # ISO code
    region: Mapped[str] = mapped_column(String(100), default="")  # e.g., "Nairobi"
    
    rate: Mapped[float] = mapped_column(Numeric(5, 2), default=0)  # Percentage
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(default=0)
