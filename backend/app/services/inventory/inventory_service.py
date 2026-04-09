from __future__ import annotations

from app.core.errors import AppError
from app.models.inventory.product import Product
from app.models.inventory.stock_movement import StockMovement
from app.models.inventory.supplier import Supplier
from app.repositories.inventory.product import ProductRepository
from app.repositories.inventory.stock_movement import StockMovementRepository
from app.repositories.inventory.supplier import SupplierRepository
from app.services.base import BaseService


class InventoryService(BaseService):
    async def create_supplier(self, *, org_id: str, data: dict) -> Supplier:
        supplier = Supplier(org_id=org_id, **data)
        created = await SupplierRepository(self.session).create(supplier)
        await self.publish("inventory.supplier_created", {"org_id": org_id, "supplier_id": created.id})
        return created

    async def list_suppliers(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[Supplier]:
        return await SupplierRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def create_product(self, *, org_id: str, data: dict) -> Product:
        # Auto-generate SKU if not provided
        if not data.get("sku"):
            import uuid
            prefix = data.get("name", "PROD")[:3].upper()
            data["sku"] = f"{prefix}-{uuid.uuid4().hex[:6].upper()}"
        product = Product(org_id=org_id, **data)
        created = await ProductRepository(self.session).create(product)
        await self.publish("inventory.product_created", {"org_id": org_id, "product_id": created.id})
        return created

    async def list_products(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[Product]:
        return await ProductRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def update_product(self, *, org_id: str, product_id: str, data: dict) -> Product:
        repo = ProductRepository(self.session)
        product = await repo.get(org_id=org_id, id=product_id)
        updated = await repo.update(product, data)
        await self.publish("inventory.product_updated", {"org_id": org_id, "product_id": updated.id})
        return updated

    async def record_stock_movement(self, *, org_id: str, product_id: str, quantity_delta: int, reason: str) -> StockMovement:
        if quantity_delta == 0:
            raise AppError("Quantity delta cannot be zero", status_code=400, code="invalid_quantity")
        movement = StockMovement(org_id=org_id, product_id=product_id, quantity_delta=quantity_delta, reason=reason)
        created = await StockMovementRepository(self.session).create(movement)
        await self.publish(
            "inventory.stock_movement_recorded",
            {"org_id": org_id, "movement_id": created.id, "product_id": product_id},
        )
        return created

    async def stock_levels(self, *, org_id: str) -> list[dict]:
        levels = await ProductRepository(self.session).stock_levels(org_id=org_id)
        return [
            {
                "product_id": p.id,
                "sku": p.sku,
                "name": p.name,
                "on_hand": on_hand,
                "reorder_level": p.reorder_level,
                "needs_reorder": on_hand <= p.reorder_level,
            }
            for p, on_hand in levels
        ]

