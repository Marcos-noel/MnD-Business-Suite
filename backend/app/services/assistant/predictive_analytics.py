from __future__ import annotations

from datetime import date, timedelta

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sqlalchemy import Date, cast, func, select

from app.models.commerce.order import CommerceOrder
from app.models.finance.transaction import Transaction


class PredictiveAnalyticsService:
    def __init__(self, session):
        self.session = session

    async def build_timeseries(self, *, org_id: str, days: int = 180) -> pd.DataFrame:
        end = date.today()
        start = end - timedelta(days=days)

        revenue_q = (
            select(Transaction.day, func.coalesce(func.sum(Transaction.amount), 0).label("revenue"))
            .where(Transaction.org_id == org_id)
            .where(Transaction.kind == "revenue")
            .where(Transaction.day >= start)
            .where(Transaction.day <= end)
            .group_by(Transaction.day)
        )
        expense_q = (
            select(Transaction.day, func.coalesce(func.sum(Transaction.amount), 0).label("expense"))
            .where(Transaction.org_id == org_id)
            .where(Transaction.kind == "expense")
            .where(Transaction.day >= start)
            .where(Transaction.day <= end)
            .group_by(Transaction.day)
        )
        order_q = (
            select(
                cast(CommerceOrder.created_at, Date).label("day"),
                func.coalesce(func.sum(CommerceOrder.total), 0).label("order_total"),
                func.count(CommerceOrder.id).label("order_count"),
            )
            .where(CommerceOrder.org_id == org_id)
            .where(CommerceOrder.created_at >= start)
            .group_by(cast(CommerceOrder.created_at, Date))
        )

        revenue_rows = (await self.session.execute(revenue_q)).all()
        expense_rows = (await self.session.execute(expense_q)).all()
        order_rows = (await self.session.execute(order_q)).all()

        df = pd.DataFrame({"day": pd.date_range(start=start, end=end, freq="D")})
        if revenue_rows:
            revenue_df = pd.DataFrame(revenue_rows, columns=["day", "revenue"])
            df = df.merge(revenue_df, on="day", how="left")
        else:
            df["revenue"] = 0.0
        if expense_rows:
            expense_df = pd.DataFrame(expense_rows, columns=["day", "expense"])
            df = df.merge(expense_df, on="day", how="left")
        else:
            df["expense"] = 0.0
        if order_rows:
            order_df = pd.DataFrame(order_rows, columns=["day", "order_total", "order_count"])
            df = df.merge(order_df, on="day", how="left")
        else:
            df["order_total"] = 0.0
            df["order_count"] = 0.0

        df = df.fillna(0.0)
        df["net_revenue"] = df["revenue"] - df["expense"]
        return df

    def _forecast_series(self, series: pd.Series, horizon: int = 30) -> np.ndarray:
        values = series.astype(float).values
        if len(values) < 14 or np.all(values == 0):
            avg = float(np.mean(values[-7:])) if len(values) else 0.0
            return np.full(horizon, avg)
        seasonal = 7 if len(values) >= 21 else None
        model = ExponentialSmoothing(values, trend="add", seasonal="add" if seasonal else None, seasonal_periods=seasonal)
        fitted = model.fit(optimized=True)
        forecast = fitted.forecast(horizon)
        return np.maximum(forecast, 0)

    def _confidence(self, series: pd.Series) -> float:
        if series.empty:
            return 0.3
        variability = float(series.std()) if series.std() else 0.0
        mean = float(series.mean()) if series.mean() else 1.0
        stability = max(0.2, 1 - min(variability / mean, 0.8))
        coverage = min(len(series) / 180, 1.0)
        return round(0.4 + 0.6 * stability * coverage, 2)

    def _anomaly_detection(self, df: pd.DataFrame) -> list[dict]:
        if len(df) < 30:
            return []
        features = df[["revenue", "expense", "order_total", "order_count"]].astype(float).values
        model = IsolationForest(n_estimators=200, contamination=0.08, random_state=42)
        preds = model.fit_predict(features)
        scores = model.decision_function(features)
        anomalies = []
        for idx, pred in enumerate(preds):
            if pred == -1:
                severity = float(abs(scores[idx]))
                row = df.iloc[idx]
                anomalies.append(
                    {
                        "date": row["day"].strftime("%Y-%m-%d"),
                        "metric": "revenue",
                        "value": float(row["revenue"]),
                        "severity": round(severity, 3),
                    }
                )
        return anomalies

    async def predictive_analytics(self, *, org_id: str, horizon: int = 30) -> dict:
        df = await self.build_timeseries(org_id=org_id)
        history_window = 90 if len(df) >= 90 else len(df)
        history = df.tail(history_window)

        revenue_forecast = self._forecast_series(df["revenue"], horizon=horizon)
        expense_forecast = self._forecast_series(df["expense"], horizon=horizon)
        orders_forecast = self._forecast_series(df["order_total"], horizon=horizon)

        start_date = df["day"].iloc[-1] + timedelta(days=1) if len(df) else date.today()
        forecast_days = pd.date_range(start=start_date, periods=horizon, freq="D")

        def series_payload(metric: str, history_values: pd.Series, forecast_values: np.ndarray) -> dict:
            return {
                "metric": metric,
                "history": [
                    {"date": d.strftime("%Y-%m-%d"), "value": float(v)}
                    for d, v in zip(history["day"], history_values)
                ],
                "forecast": [
                    {"date": d.strftime("%Y-%m-%d"), "value": float(v)}
                    for d, v in zip(forecast_days, forecast_values)
                ],
            }

        anomalies = self._anomaly_detection(df)
        confidence = self._confidence(df["revenue"])
        return {
            "series": [
                series_payload("revenue", history["revenue"], revenue_forecast),
                series_payload("expense", history["expense"], expense_forecast),
                series_payload("order_total", history["order_total"], orders_forecast),
            ],
            "anomalies": anomalies,
            "model_info": {
                "model": "Holt-Winters + IsolationForest",
                "confidence": confidence,
                "coverage_days": len(df),
                "notes": "Forecasts trained on org-level financial + commerce data.",
            },
        }
