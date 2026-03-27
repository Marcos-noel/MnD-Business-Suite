from __future__ import annotations

from pydantic import BaseModel


class DashboardKpis(BaseModel):
    employees: int
    products: int
    customers: int
    open_opportunities: int
    export_orders_open: int
    revenue_30d: float
    expenses_30d: float
    profit_30d: float
    low_stock_items: int

