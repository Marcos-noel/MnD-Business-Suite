from __future__ import annotations

import secrets
from datetime import date

from sqlalchemy import select

from app.core.errors import AppError
from app.models.commerce.order import CommerceOrder
from app.models.commerce.order_item import CommerceOrderItem
from app.models.inventory.product import Product
from app.models.crm.customer import Customer
from app.repositories.commerce.order import CommerceOrderRepository
from app.repositories.commerce.order_item import CommerceOrderItemRepository
from app.repositories.crm.customer import CustomerRepository
from app.repositories.inventory.product import ProductRepository
from app.services.base import BaseService
from app.services.finance.finance_service import FinanceService
from app.services.inventory.inventory_service import InventoryService


def _make_order_no() -> str:
    return f"ORD-{date.today().strftime('%Y%m%d')}-{secrets.token_hex(3).upper()}"


class CommerceService(BaseService):
    async def list_orders(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[CommerceOrder]:
        return await CommerceOrderRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def get_order(self, *, org_id: str, order_id: str) -> tuple[CommerceOrder, list[CommerceOrderItem]]:
        order = await CommerceOrderRepository(self.session).get(org_id=org_id, id=order_id)
        items = await CommerceOrderItemRepository(self.session).list_by_order(org_id=org_id, order_id=order.id)
        return order, items

    async def create_order(self, *, org_id: str, data: dict) -> tuple[CommerceOrder, list[CommerceOrderItem]]:
        items_in = data.get("items") or []
        if not items_in:
            raise AppError("Order requires at least one item", status_code=400, code="invalid_order")

        product_repo = ProductRepository(self.session)
        resolved: list[tuple[Product, int]] = []
        currency: str | None = data.get("currency")

        for it in items_in:
            pid = it["product_id"]
            qty = int(it["quantity"])
            if qty <= 0:
                raise AppError("Quantity must be positive", status_code=400, code="invalid_quantity")
            product = await product_repo.get(org_id=org_id, id=pid)
            if product.sell_price <= 0:
                raise AppError(f"Product '{product.sku}' has no sell price", status_code=400, code="no_price")
            if currency is None:
                currency = product.currency
            if product.currency != currency:
                raise AppError("All items must use the same currency", status_code=400, code="currency_mismatch")
            resolved.append((product, qty))

        subtotal = sum(float(p.sell_price) * qty for p, qty in resolved)
        tax = 0.0
        shipping = 0.0
        total = subtotal + tax + shipping

        order = CommerceOrder(
            org_id=org_id,
            order_no=_make_order_no(),
            customer_id=data.get("customer_id"),
            customer_name=(data.get("customer_name") or "").strip(),
            customer_email=str(data.get("customer_email") or ""),
            currency=currency or "KES",
            subtotal=subtotal,
            tax=tax,
            shipping=shipping,
            total=total,
            status="pending_payment",
            payment_status="unpaid",
        )
        order = await CommerceOrderRepository(self.session).create(order)

        created_items: list[CommerceOrderItem] = []
        item_repo = CommerceOrderItemRepository(self.session)
        for product, qty in resolved:
            item = CommerceOrderItem(
                org_id=org_id,
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                quantity=qty,
                unit_price=float(product.sell_price),
                line_total=float(product.sell_price) * qty,
            )
            created_items.append(await item_repo.create(item))

        await self.publish("commerce.order_created", {"org_id": org_id, "order_id": order.id})
        return order, created_items

    async def pay_order(self, *, org_id: str, order_id: str, provider: str, reference: str) -> dict:
        order_repo = CommerceOrderRepository(self.session)
        order = await order_repo.get(org_id=org_id, id=order_id)
        if order.payment_status == "paid":
            raise AppError("Order already paid", status_code=400, code="already_paid")

        tx = await FinanceService(self.session).collect_payment(
            org_id=org_id,
            amount=float(order.total),
            provider=provider,
            reference=reference,
            description=f"Order {order.order_no}",
            source_type="commerce_order",
            source_id=order.id,
        )

        updated = await order_repo.update(
            order,
            {
                "payment_status": "paid",
                "payment_provider": tx.provider,
                "payment_reference": tx.reference,
                "status": "processing",
            },
        )

        # Immediate fulfillment for the demo foundation; automation hooks also fire.
        items = await CommerceOrderItemRepository(self.session).list_by_order(org_id=org_id, order_id=updated.id)
        inv = InventoryService(self.session)
        for it in items:
            await inv.record_stock_movement(
                org_id=org_id, product_id=it.product_id, quantity_delta=-int(it.quantity), reason="sale"
            )

        await self.publish("commerce.order_paid", {"org_id": org_id, "order_id": updated.id})
        return {"order_id": updated.id, "transaction_id": tx.id}

    async def list_storefront_products(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[Product]:
        res = await self.session.execute(
            select(Product)
            .where(Product.org_id == org_id)
            .where(Product.is_published.is_(True))
            .order_by(Product.name.asc())
            .limit(limit)
            .offset(offset)
        )
        return list(res.scalars().all())

    async def storefront_checkout(self, *, org_id: str, customer_name: str, customer_email: str, items: list[dict], provider: str, reference: str) -> dict:
        customer_repo = CustomerRepository(self.session)
        existing = await customer_repo.get_by_email(org_id=org_id, email=customer_email)
        customer: Customer
        if existing is None:
            customer = await customer_repo.create(
                Customer(org_id=org_id, name=customer_name.strip(), email=customer_email.lower())
            )
        else:
            customer = existing

        order, _ = await self.create_order(
            org_id=org_id,
            data={
                "customer_id": customer.id,
                "customer_name": customer_name,
                "customer_email": customer_email,
                "items": items,
            },
        )
        result = await self.pay_order(org_id=org_id, order_id=order.id, provider=provider, reference=reference)
        return {"order_id": order.id, **result}
