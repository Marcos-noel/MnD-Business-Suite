from __future__ import annotations

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    reply: str


class Recommendation(BaseModel):
    title: str
    rationale: str
    impact: str


class RecommendationsResponse(BaseModel):
    recommendations: list[Recommendation]


class ForecastResponse(BaseModel):
    revenue_next_30d: float
    expenses_next_30d: float
    confidence: float


class AnalyticsResponse(BaseModel):
    top_customers: list[str]
    pipeline_value: float
    low_stock_skus: list[str]


class PredictivePoint(BaseModel):
    date: str
    value: float


class PredictiveSeries(BaseModel):
    metric: str
    history: list[PredictivePoint]
    forecast: list[PredictivePoint]


class PredictiveAnomaly(BaseModel):
    date: str
    metric: str
    value: float
    severity: float


class PredictiveModelInfo(BaseModel):
    model: str
    confidence: float
    coverage_days: int
    notes: str


class PredictiveAnalyticsResponse(BaseModel):
    series: list[PredictiveSeries]
    anomalies: list[PredictiveAnomaly]
    model_info: PredictiveModelInfo
