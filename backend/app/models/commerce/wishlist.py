from __future__ import annotations

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TenantScopedBase


class Wishlist(TenantScopedBase):
    __tablename__ = "commerce_wishlist_items"
    __table_args__ = (
        UniqueConstraint('org_id', 'user_id', 'product_id', name='uq_wishlist_user_product'),
    )

    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("auth_users.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("inv_products.id", ondelete="CASCADE"), index=True)
    
    class Config:
        indexes = [
            ("org_id", "user_id"),
            ("org_id", "product_id"),
        ]
