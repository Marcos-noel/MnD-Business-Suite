from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class Cart(TenantScopedBase):
    __tablename__ = "commerce_carts"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    session_id: Mapped[str] = mapped_column(String(64), index=True)  # For guest carts
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("auth_users.id", ondelete="CASCADE"), nullable=True)  # For logged-in customers
    
    customer_email: Mapped[str] = mapped_column(String(255), default="")
    customer_name: Mapped[str] = mapped_column(String(200), default="")


class CartItem(TenantScopedBase):
    __tablename__ = "commerce_cart_items"

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    cart_id: Mapped[str] = mapped_column(String(36), ForeignKey("commerce_carts.id", ondelete="CASCADE"), index=True)
    
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("inv_products.id", ondelete="CASCADE"), index=True)
    variant_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("inv_product_variants.id", ondelete="SET NULL"), nullable=True)
    
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    notes: Mapped[str] = mapped_column(Text, default="")
