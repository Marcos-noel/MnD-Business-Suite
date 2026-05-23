from __future__ import annotations

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class QuoteLineCreate(APIModel):
    item_name: str = Field(min_length=1, max_length=200)
    quantity: float = Field(gt=0)
    unit_price: float = Field(ge=0)


class QuoteCreate(APIModel):
    customer_id: str
    opportunity_id: str | None = None
    currency: str = Field(default="USD", min_length=3, max_length=8)
    tax: float = Field(default=0, ge=0)
    discount: float = Field(default=0, ge=0)
    notes: str = Field(default="", max_length=500)
    lines: list[QuoteLineCreate] = Field(default_factory=list)


class QuoteStatusUpdate(APIModel):
    status: str = Field(pattern=r"^(draft|review|approved|sent|accepted|rejected)$")


class QuoteLineRead(Timestamped):
    org_id: str
    quote_id: str
    item_name: str
    quantity: float
    unit_price: float
    line_total: float


class QuoteRead(Timestamped):
    org_id: str
    customer_id: str
    opportunity_id: str | None
    quote_no: str
    status: str
    currency: str
    subtotal: float
    tax: float
    discount: float
    total: float
    notes: str
    lines: list[QuoteLineRead] = Field(default_factory=list)
