from __future__ import annotations

from datetime import date

from pydantic import Field

from app.schemas.common import APIModel, Timestamped


class TransactionCreate(APIModel):
    day: date
    kind: str = Field(pattern=r"^(revenue|expense)$")
    category: str = Field(default="general", max_length=80)
    provider: str = Field(default="manual", max_length=40)
    reference: str = Field(default="", max_length=80)
    source_type: str = Field(default="", max_length=40)
    source_id: str = Field(default="", max_length=36)
    amount: float = Field(gt=0)
    description: str = Field(default="", max_length=255)


class TransactionRead(Timestamped):
    org_id: str
    day: date
    kind: str
    category: str
    provider: str
    reference: str
    source_type: str
    source_id: str
    amount: float
    description: str


class CollectPaymentRequest(APIModel):
    amount: float = Field(gt=0)
    provider: str = Field(pattern=r"^(cash|mobile_money|mpesa|stripe|bank)$")
    reference: str = Field(default="", max_length=80)
    description: str = Field(default="Payment received", max_length=255)


class ProfitSnapshot(APIModel):
    revenue: float
    expenses: float
    profit: float
