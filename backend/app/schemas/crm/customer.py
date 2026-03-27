from __future__ import annotations

from datetime import datetime

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class CustomerCreate(APIModel):
    name: str = Field(min_length=2, max_length=200)
    email: str = Field(default="", max_length=255)
    phone: str = Field(default="", max_length=60)
    notes: str = Field(default="", max_length=500)


class CustomerUpdate(APIModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=60)
    notes: str | None = Field(default=None, max_length=500)


class CustomerRead(Timestamped):
    org_id: str
    name: str
    email: str
    phone: str
    notes: str


class CustomerOrderSummary(APIModel):
    id: str
    order_no: str
    currency: str
    total: float
    status: str
    created_at: datetime
