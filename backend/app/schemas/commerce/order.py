from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class CommerceOrderItemCreate(APIModel):
    product_id: str
    quantity: int = Field(ge=1, le=100000)


class CommerceOrderCreate(APIModel):
    customer_id: str | None = None
    customer_name: str = Field(default="", max_length=200)
    customer_email: str | None = Field(default=None, pattern=r"^.+@.+\..+$", max_length=255)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    items: list[CommerceOrderItemCreate] = Field(min_length=1)


class CommerceOrderPayRequest(APIModel):
    provider: str = Field(pattern=r"^(cash|mobile_money|mpesa|stripe|bank)$")
    reference: str = Field(default="", max_length=80)


class CommerceOrderItemRead(Timestamped):
    org_id: str
    order_id: str
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    line_total: float


class CommerceOrderRead(Timestamped):
    org_id: str
    order_no: str
    customer_id: str | None
    customer_name: str
    customer_email: str
    currency: str
    subtotal: float
    tax: float
    shipping: float
    total: float
    status: str
    payment_status: str
    payment_provider: str
    payment_reference: str
    items: list[CommerceOrderItemRead] = []


class StorefrontProductRead(APIModel):
    id: str
    sku: str
    name: str
    description: str
    image_url: str
    sell_price: float
    currency: str


class StorefrontCheckoutRequest(APIModel):
    customer_name: str = Field(min_length=2, max_length=200)
    customer_email: str = Field(pattern=r"^.+@.+\..+$", max_length=255)
    items: list[CommerceOrderItemCreate] = Field(min_length=1)
    provider: str = Field(pattern=r"^(cash|mobile_money|mpesa|stripe|bank)$")
    reference: str = Field(default="", max_length=80)
