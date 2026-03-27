from __future__ import annotations

from datetime import date

from pydantic import Field

from app.schemas.common import APIModel


class DailySeriesPoint(APIModel):
    day: date
    revenue: float = 0
    expenses: float = 0
    profit: float = 0


class TopProduct(APIModel):
    product_name: str
    quantity: int = Field(ge=0)
    amount: float = 0


class AnalyticsOverview(APIModel):
    series: list[DailySeriesPoint]
    top_products: list[TopProduct]

