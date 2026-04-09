from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class ProductVariant(TenantScopedBase):
    __tablename__ = "inv_product_variants"
    __table_args__ = (UniqueConstraint("product_id", "sku", name="uq_product_variant_sku"),)

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("inv_products.id", ondelete="CASCADE"), index=True)
    
    sku: Mapped[str] = mapped_column(String(60), index=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(String(500), default="")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    
    price: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    compare_at_price: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    cost_per_item: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    
    inventory_quantity: Mapped[int] = mapped_column(Integer, default=0)
    inventory_policy: Mapped[str] = mapped_column(String(20), default="deny")  # deny|continue
    track_inventory: Mapped[bool] = mapped_column(Boolean, default=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    sort_order: Mapped[int] = mapped_column(default=0)
    
    # Variant options (JSON for flexibility)
    options: Mapped[str] = mapped_column(String(500), default="{}")  # {"color": "Red", "size": "M"}
