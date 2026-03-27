from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class ProductCreate(APIModel):
    sku: str = Field(min_length=1, max_length=60)
    name: str = Field(min_length=2, max_length=200)
    description: str = Field(default="", max_length=5000)
    image_url: str = Field(default="", max_length=500)
    unit: str = Field(default="pcs", max_length=30)
    reorder_level: int = Field(default=10, ge=0)
    unit_cost: float = Field(default=0, ge=0)
    sell_price: float = Field(default=0, ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    is_published: bool = Field(default=False)


class ProductUpdate(APIModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    image_url: str | None = Field(default=None, max_length=500)
    unit: str | None = Field(default=None, max_length=30)
    reorder_level: int | None = Field(default=None, ge=0)
    unit_cost: float | None = Field(default=None, ge=0)
    sell_price: float | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    is_published: bool | None = None


class ProductRead(Timestamped):
    org_id: str
    sku: str
    name: str
    description: str
    image_url: str
    unit: str
    reorder_level: int
    unit_cost: float
    sell_price: float
    currency: str
    is_published: bool


class StockMovementCreate(APIModel):
    product_id: str
    quantity_delta: int
    reason: str = Field(default="adjustment", max_length=120)


class StockMovementRead(Timestamped):
    org_id: str
    product_id: str
    quantity_delta: int
    reason: str
    occurred_at: str


class StockLevel(APIModel):
    product_id: str
    sku: str
    name: str
    on_hand: int
    reorder_level: int
    needs_reorder: bool
