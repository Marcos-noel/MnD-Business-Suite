from __future__ import annotations

from datetime import datetime, timedelta
from typing import Sequence

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_permission
from app.core.deps import DbSession
from app.models.commerce.order import CommerceOrder
from app.models.commerce.order_item import CommerceOrderItem
from app.schemas.analytics.overview import AnalyticsOverview
from app.services.analytics.analytics_service import AnalyticsService


router = APIRouter()


@router.get("/overview", response_model=AnalyticsOverview, dependencies=[require_permission("analytics.read")])
async def overview(session: DbSession, auth: CurrentAuth, days: int = 30) -> AnalyticsOverview:
    data = await AnalyticsService(session).overview(org_id=auth.org_id, days=days)
    return AnalyticsOverview(**data)


class SalesDataPoint(BaseModel):
    date: str
    orders: int
    revenue: float


class TopProduct(BaseModel):
    product_id: str
    product_name: str
    quantity_sold: int
    revenue: float


class RevenueSummary(BaseModel):
    total_revenue: float
    total_orders: int
    average_order_value: float
    by_status: dict[str, float]


@router.get("/sales", response_model=list[SalesDataPoint])
async def sales_analytics(
    session: DbSession,
    auth: CurrentAuth,
    days: int = Query(30, le=365),
    interval: str = Query("daily", pattern=r"^(daily|weekly|monthly)$"),
) -> list[SalesDataPoint]:
    """Get sales data over time"""
    from sqlalchemy import text

    start_date = datetime.utcnow() - timedelta(days=days)

    query = text("""
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as orders,
            SUM(total) as revenue
        FROM com_orders
        WHERE org_id = :org_id
            AND created_at >= :start_date
            AND payment_status = 'paid'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    """)

    result = await session.execute(query, {"org_id": auth.org_id, "start_date": start_date})

    return [SalesDataPoint(
        date=str(row.date),
        orders=row.orders,
        revenue=float(row.revenue or 0),
    ) for row in result]


@router.get("/top-products", response_model=list[TopProduct])
async def top_products(
    session: DbSession,
    auth: CurrentAuth,
    limit: int = Query(10, le=50),
    days: int = Query(30, le=365),
) -> list[TopProduct]:
    """Get top selling products"""
    start_date = datetime.utcnow() - timedelta(days=days)

    query = select(
        CommerceOrderItem.product_id,
        CommerceOrderItem.product_name,
        func.sum(CommerceOrderItem.quantity).label("quantity_sold"),
        func.sum(CommerceOrderItem.line_total).label("revenue"),
    ).join(
        CommerceOrder,
        CommerceOrderItem.order_id == CommerceOrder.id
    ).where(
        CommerceOrder.org_id == auth.org_id,
        CommerceOrder.created_at >= start_date,
        CommerceOrder.payment_status == "paid",
    ).group_by(
        CommerceOrderItem.product_id,
        CommerceOrderItem.product_name,
    ).order_by(
        func.sum(CommerceOrderItem.quantity).desc()
    ).limit(limit)

    result = await session.execute(query)

    return [TopProduct(
        product_id=row.product_id,
        product_name=row.product_name,
        quantity_sold=int(row.quantity_sold),
        revenue=float(row.revenue),
    ) for row in result]


@router.get("/revenue", response_model=RevenueSummary)
async def revenue_summary(
    session: DbSession,
    auth: CurrentAuth,
    days: int = Query(30, le=365),
) -> RevenueSummary:
    """Get revenue summary"""
    start_date = datetime.utcnow() - timedelta(days=days)

    # Get totals
    order_query = select(
        func.count(CommerceOrder.id).label("total_orders"),
        func.sum(CommerceOrder.total).label("total_revenue"),
    ).where(
        CommerceOrder.org_id == auth.org_id,
        CommerceOrder.created_at >= start_date,
        CommerceOrder.payment_status == "paid",
    )

    result = await session.execute(order_query)
    row = result.one()

    total_orders = int(row.total_orders or 0)
    total_revenue = float(row.total_revenue or 0)
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0

    # Get by status
    status_query = select(
        CommerceOrder.status,
        func.sum(CommerceOrder.total).label("revenue"),
    ).where(
        CommerceOrder.org_id == auth.org_id,
        CommerceOrder.created_at >= start_date,
        CommerceOrder.payment_status == "paid",
    ).group_by(CommerceOrder.status)

    status_result = await session.execute(status_query)
    by_status = {row.status: float(row.revenue or 0) for row in status_result}

    return RevenueSummary(
        total_revenue=total_revenue,
        total_orders=total_orders,
        average_order_value=avg_order_value,
        by_status=by_status,
    )
