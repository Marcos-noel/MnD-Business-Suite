from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy import func, select

from app.models.crm.customer import Customer
from app.models.crm.opportunity import Opportunity
from app.models.export_mgmt.export_order import ExportOrder
from app.models.finance.transaction import Transaction
from app.models.hr.employee import Employee
from app.models.inventory.product import Product
from app.models.inventory.stock_movement import StockMovement
from app.services.base import BaseService


class ErpService(BaseService):
    async def dashboard_kpis(self, *, org_id: str) -> dict:
        end = date.today()
        start = end - timedelta(days=30)

        employees = (await self.session.execute(select(func.count()).select_from(Employee).where(Employee.org_id == org_id))).scalar_one()
        products = (await self.session.execute(select(func.count()).select_from(Product).where(Product.org_id == org_id))).scalar_one()
        customers = (await self.session.execute(select(func.count()).select_from(Customer).where(Customer.org_id == org_id))).scalar_one()

        open_opps = (
            await self.session.execute(
                select(func.count())
                .select_from(Opportunity)
                .where(Opportunity.org_id == org_id)
                .where(Opportunity.stage.in_(["lead", "qualified", "proposal"]))
            )
        ).scalar_one()

        export_open = (
            await self.session.execute(
                select(func.count())
                .select_from(ExportOrder)
                .where(ExportOrder.org_id == org_id)
                .where(ExportOrder.status.in_(["confirmed", "shipped"]))
            )
        ).scalar_one()

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
        low_stock_items = len(low_stock)

        revenue_f = float(revenue)
        expenses_f = float(expenses)
        return {
            "employees": int(employees),
            "products": int(products),
            "customers": int(customers),
            "open_opportunities": int(open_opps),
            "export_orders_open": int(export_open),
            "revenue_30d": round(revenue_f, 2),
            "expenses_30d": round(expenses_f, 2),
            "profit_30d": round(revenue_f - expenses_f, 2),
            "low_stock_items": int(low_stock_items),
        }

