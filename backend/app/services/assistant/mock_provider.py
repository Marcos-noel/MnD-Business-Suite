from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy import func, select

from app.models.crm.customer import Customer
from app.models.crm.opportunity import Opportunity
from app.models.finance.transaction import Transaction
from app.models.inventory.product import Product
from app.models.inventory.stock_movement import StockMovement
from app.services.assistant.predictive_analytics import PredictiveAnalyticsService
from app.services.assistant.provider import AssistantProvider


class MockAssistantProvider(AssistantProvider):
    def __init__(self, session):
        self.session = session

    async def chat(self, *, org_id: str, user_id: str, message: str) -> str:
        msg = message.lower()
        if "profit" in msg or "revenue" in msg:
            end = date.today()
            start = end - timedelta(days=30)
            revenue = (
                await self.session.execute(
                    select(func.coalesce(func.sum(Transaction.amount), 0))
                    .where(Transaction.org_id == org_id)
                    .where(Transaction.kind == "revenue")
                    .where(Transaction.day >= start)
                    .where(Transaction.day <= end)
                )
            ).scalar_one()
            expenses = (
                await self.session.execute(
                    select(func.coalesce(func.sum(Transaction.amount), 0))
                    .where(Transaction.org_id == org_id)
                    .where(Transaction.kind == "expense")
                    .where(Transaction.day >= start)
                    .where(Transaction.day <= end)
                )
            ).scalar_one()
            profit = float(revenue) - float(expenses)
            return f"Last 30 days: revenue {float(revenue):.2f}, expenses {float(expenses):.2f}, profit {profit:.2f}."
        if "stock" in msg or "inventory" in msg:
            res = await self.session.execute(
                select(
                    Product.sku,
                    func.coalesce(func.sum(StockMovement.quantity_delta), 0).label("on_hand"),
                    Product.reorder_level,
                )
                .outerjoin(
                    StockMovement,
                    (StockMovement.product_id == Product.id) & (StockMovement.org_id == org_id),
                )
                .where(Product.org_id == org_id)
                .group_by(Product.id)
                .having(func.coalesce(func.sum(StockMovement.quantity_delta), 0) <= Product.reorder_level)
                .limit(5)
            )
            items = [f"{sku} (on_hand={on_hand})" for sku, on_hand, _ in res.all()]
            if not items:
                return "Inventory looks healthy: no low-stock items found."
            return "Low stock items to reorder: " + ", ".join(items)
        return "I can help with KPIs, inventory alerts, CRM pipeline, and export operations. Ask about profit, stock, pipeline, or shipments."

    async def recommendations(self, *, org_id: str) -> list[dict]:
        recs: list[dict] = []

        pipeline = (
            await self.session.execute(
                select(func.coalesce(func.sum(Opportunity.value), 0))
                .where(Opportunity.org_id == org_id)
                .where(Opportunity.stage.in_(["lead", "qualified", "proposal"]))
            )
        ).scalar_one()
        if float(pipeline) < 1000:
            recs.append(
                {
                    "title": "Boost pipeline activity",
                    "rationale": "Your open pipeline value is low.",
                    "impact": "Add follow-ups and qualify leads to improve revenue predictability.",
                }
            )

        low_stock = (
            await self.session.execute(
                select(func.count())
                .select_from(Product)
                .outerjoin(
                    StockMovement,
                    (StockMovement.product_id == Product.id) & (StockMovement.org_id == org_id),
                )
                .where(Product.org_id == org_id)
                .group_by(Product.id, Product.reorder_level)
                .having(func.coalesce(func.sum(StockMovement.quantity_delta), 0) <= Product.reorder_level)
            )
        ).all()
        if len(low_stock) > 0:
            recs.append(
                {
                    "title": "Reorder low-stock items",
                    "rationale": f"{len(low_stock)} products are at or below reorder level.",
                    "impact": "Avoid stock-outs and late deliveries.",
                }
            )

        customers = (
            await self.session.execute(select(func.count()).select_from(Customer).where(Customer.org_id == org_id))
        ).scalar_one()
        if int(customers) < 5:
            recs.append(
                {
                    "title": "Grow your customer base",
                    "rationale": "Customer list is still small.",
                    "impact": "Add leads and track interactions to close more deals.",
                }
            )
        return recs[:5] or [
            {
                "title": "Keep up the momentum",
                "rationale": "Core metrics look stable.",
                "impact": "Maintain regular reviews of inventory, CRM pipeline, and finance KPIs.",
            }
        ]

    async def forecast(self, *, org_id: str) -> dict:
        analytics = await PredictiveAnalyticsService(self.session).predictive_analytics(org_id=org_id)
        revenue_next = sum(point["value"] for point in analytics["series"][0]["forecast"])
        expense_next = sum(point["value"] for point in analytics["series"][1]["forecast"])
        return {
            "revenue_next_30d": float(revenue_next),
            "expenses_next_30d": float(expense_next),
            "confidence": float(analytics["model_info"]["confidence"]),
        }

    async def analytics(self, *, org_id: str) -> dict:
        top_customers_res = await self.session.execute(
            select(Customer.name).where(Customer.org_id == org_id).order_by(Customer.created_at.desc()).limit(5)
        )
        top_customers = list(top_customers_res.scalars().all())

        pipeline = (
            await self.session.execute(
                select(func.coalesce(func.sum(Opportunity.value), 0))
                .where(Opportunity.org_id == org_id)
                .where(Opportunity.stage.in_(["lead", "qualified", "proposal"]))
            )
        ).scalar_one()

        low_stock_res = await self.session.execute(
            select(Product.sku)
            .outerjoin(
                StockMovement,
                (StockMovement.product_id == Product.id) & (StockMovement.org_id == org_id),
            )
            .where(Product.org_id == org_id)
            .group_by(Product.id)
            .having(func.coalesce(func.sum(StockMovement.quantity_delta), 0) <= Product.reorder_level)
            .limit(10)
        )
        low_stock_skus = list(low_stock_res.scalars().all())

        return {"top_customers": top_customers, "pipeline_value": float(pipeline), "low_stock_skus": low_stock_skus}

    async def predictive_analytics(self, *, org_id: str) -> dict:
        return await PredictiveAnalyticsService(self.session).predictive_analytics(org_id=org_id)
