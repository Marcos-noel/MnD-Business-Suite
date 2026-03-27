from __future__ import annotations

from app.core.errors import AppError
from app.models.export_mgmt.export_document import ExportDocument
from app.models.export_mgmt.export_order import ExportOrder
from app.models.export_mgmt.shipment import Shipment
from app.repositories.export_mgmt.document import ExportDocumentRepository
from app.repositories.export_mgmt.order import ExportOrderRepository
from app.repositories.export_mgmt.shipment import ShipmentRepository
from app.services.base import BaseService
from app.services.export_mgmt.rules import rules_registry
from app.workers.queue import get_queue


class ExportService(BaseService):
    async def create_order(self, *, org_id: str, data: dict) -> ExportOrder:
        order = ExportOrder(org_id=org_id, **data)
        created = await ExportOrderRepository(self.session).create(order)
        await self.publish("exports.order_created", {"org_id": org_id, "order_id": created.id})
        return created

    async def list_orders(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[ExportOrder]:
        return await ExportOrderRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def update_order(self, *, org_id: str, order_id: str, data: dict) -> ExportOrder:
        repo = ExportOrderRepository(self.session)
        order = await repo.get(org_id=org_id, id=order_id)
        if data.get("status") == "confirmed" and order.status != "confirmed":
            # Validate against the post-update view (without committing)
            if "destination_country" in data and data["destination_country"] is not None:
                order.destination_country = data["destination_country"]
            errors = await rules_registry.validate(order=order)
            if errors:
                raise AppError("; ".join(errors), status_code=400, code="export_rule_violation")
        updated = await repo.update(order, data)
        await self.publish("exports.order_updated", {"org_id": org_id, "order_id": updated.id})
        return updated

    async def create_shipment(self, *, org_id: str, data: dict) -> Shipment:
        shipment = Shipment(org_id=org_id, **data)
        created = await ShipmentRepository(self.session).create(shipment)
        await self.publish("exports.shipment_created", {"org_id": org_id, "shipment_id": created.id})
        return created

    async def list_shipments(self, *, org_id: str, limit: int = 50, offset: int = 0) -> list[Shipment]:
        return await ShipmentRepository(self.session).list(org_id=org_id, limit=limit, offset=offset)

    async def request_document(self, *, org_id: str, export_order_id: str, kind: str) -> ExportDocument:
        order = await ExportOrderRepository(self.session).get(org_id=org_id, id=export_order_id)
        if order.status == "draft":
            raise AppError("Confirm the order before generating documents", status_code=400, code="order_not_confirmed")
        doc = ExportDocument(org_id=org_id, export_order_id=export_order_id, kind=kind, status="queued")
        created = await ExportDocumentRepository(self.session).create(doc)

        q = get_queue()
        q.enqueue("app.workers.tasks.generate_export_document", created.id)

        await self.publish("exports.document_queued", {"org_id": org_id, "document_id": created.id})
        return created

    async def list_documents(self, *, org_id: str, export_order_id: str) -> list[ExportDocument]:
        return await ExportDocumentRepository(self.session).list_by_order(org_id=org_id, export_order_id=export_order_id)

    async def get_document_content(self, *, org_id: str, document_id: str) -> ExportDocument:
        return await ExportDocumentRepository(self.session).get(org_id=org_id, id=document_id)
