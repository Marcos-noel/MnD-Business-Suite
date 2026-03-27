from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy import func, select

from app.models.commerce.order import CommerceOrder
from app.models.commerce.order_item import CommerceOrderItem
from app.models.finance.transaction import Transaction
from app.services.base import BaseService


class AnalyticsService(BaseService):
    async def overview(self, *, org_id: str, days: int = 30) -> dict:
        end = date.today()
        start = end - timedelta(days=days)

        # Finance series
        res = await self.session.execute(
            select(Transaction.day, Transaction.kind, func.coalesce(func.sum(Transaction.amount), 0))
            .where(Transaction.org_id == org_id)
            .where(Transaction.day >= start)
            .where(Transaction.day <= end)
            .group_by(Transaction.day, Transaction.kind)
            .order_by(Transaction.day.asc())
        )
        by_day: dict[date, dict[str, float]] = {}
        for day, kind, amt in res.all():
            by_day.setdefault(day, {"revenue": 0.0, "expenses": 0.0})
            if kind == "revenue":
                by_day[day]["revenue"] = float(amt)
            else:
                by_day[day]["expenses"] = float(amt)

        series = []
        cur = start
        while cur <= end:
            row = by_day.get(cur, {"revenue": 0.0, "expenses": 0.0})
            series.append(
                {
                    "day": cur,
                    "revenue": row["revenue"],
                    "expenses": row["expenses"],
                    "profit": row["revenue"] - row["expenses"],
                }
            )
            cur += timedelta(days=1)

        # Top products by paid/processing orders in commerce
        subq = (
            select(CommerceOrder.id)
            .where(CommerceOrder.org_id == org_id)
            .where(CommerceOrder.payment_status == "paid")
            .subquery()
        )
        top = await self.session.execute(
            select(
                CommerceOrderItem.product_name,
                func.coalesce(func.sum(CommerceOrderItem.quantity), 0).label("qty"),
                func.coalesce(func.sum(CommerceOrderItem.line_total), 0).label("amt"),
            )
            .where(CommerceOrderItem.org_id == org_id)
            .where(CommerceOrderItem.order_id.in_(select(subq.c.id)))
            .group_by(CommerceOrderItem.product_name)
            .order_by(func.sum(CommerceOrderItem.line_total).desc())
            .limit(8)
        )

        top_products = [
            {"product_name": name, "quantity": int(qty), "amount": float(amt)} for name, qty, amt in top.all()
        ]

        return {"series": series, "top_products": top_products}

