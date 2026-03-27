from __future__ import annotations

from sqlalchemy import func, select

from app.models.crm.customer import Customer
from app.models.export_mgmt.export_order import ExportOrder
from app.models.export_mgmt.shipment import Shipment
from app.models.finance.transaction import Transaction
from app.models.inventory.product import Product
from app.services.base import BaseService


class ExportReadinessService(BaseService):
    async def score(self, *, org_id: str) -> dict:
        async def count(stmt) -> int:
            res = await self.session.execute(stmt)
            return int(res.scalar_one() or 0)

        products = await count(select(func.count()).select_from(Product).where(Product.org_id == org_id))
        published_products = await count(
            select(func.count()).select_from(Product).where(Product.org_id == org_id).where(Product.is_published.is_(True))
        )
        customers = await count(select(func.count()).select_from(Customer).where(Customer.org_id == org_id))
        confirmed_orders = await count(
            select(func.count())
            .select_from(ExportOrder)
            .where(ExportOrder.org_id == org_id)
            .where(ExportOrder.status == "confirmed")
        )
        shipments = await count(select(func.count()).select_from(Shipment).where(Shipment.org_id == org_id))
        payments = await count(select(func.count()).select_from(Transaction).where(Transaction.org_id == org_id))

        items: list[dict] = []

        def add(code: str, title: str, ok: bool, points: int, recommendation: str) -> None:
            items.append(
                {
                    "code": code,
                    "title": title,
                    "status": "complete" if ok else "missing",
                    "points": points if ok else 0,
                    "recommendation": "" if ok else recommendation,
                }
            )

        add(
            "products",
            "Product catalog created",
            products > 0,
            20,
            "Create products in Inventory and add SKU, pricing, and stock movements.",
        )
        add(
            "published_products",
            "Storefront-ready products published",
            published_products > 0,
            15,
            "Publish at least one product (set `is_published=true`) for the public storefront.",
        )
        add("customers", "Customer list available", customers > 0, 15, "Add customers in CRM to speed up order processing.")
        add(
            "confirmed_export_orders",
            "Export orders confirmed",
            confirmed_orders > 0,
            25,
            "Create and confirm export orders; confirmation enforces export rules.",
        )
        add(
            "logistics",
            "Logistics tracking (shipments)",
            shipments > 0,
            15,
            "Create shipments with tracking numbers and statuses for export orders.",
        )
        add(
            "payments",
            "Payments & reconciliation",
            payments > 0,
            10,
            "Record transactions or collect payments to track revenue and profitability.",
        )

        score = int(sum(i["points"] for i in items))
        return {"score": score, "items": items}

