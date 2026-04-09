from __future__ import annotations

from sqlalchemy import Boolean, ForeignKey, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class Product(TenantScopedBase):
    __tablename__ = "inv_products"
    __table_args__ = (UniqueConstraint("org_id", "sku", name="uq_org_sku"),)

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    sku: Mapped[str] = mapped_column(String(60), index=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    unit: Mapped[str] = mapped_column(String(30), default="pcs")
    reorder_level: Mapped[int] = mapped_column(default=10)
    inventory_quantity: Mapped[int] = mapped_column(default=0)  # Current stock level
    unit_cost: Mapped[float] = mapped_column(Numeric(12, 2), default=0)

    sell_price: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    currency: Mapped[str] = mapped_column(String(3), default="KES")
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    
    # Category and SEO
    category_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("inv_categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    meta_title: Mapped[str] = mapped_column(String(200), default="")
    meta_description: Mapped[str] = mapped_column(String(500), default="")
    tags: Mapped[str] = mapped_column(String(500), default="")  # Comma-separated tags
