from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_permission
from app.core.deps import DbSession
from app.schemas.export_mgmt.order import (
    DocumentRequest,
    ExportDocumentContent,
    ExportDocumentRead,
    ExportOrderCreate,
    ExportOrderRead,
    ExportOrderUpdate,
    ShipmentCreate,
    ShipmentRead,
)
from app.schemas.export_mgmt.readiness import ExportReadinessScore
from app.services.export_mgmt.export_service import ExportService
from app.services.export_mgmt.readiness_service import ExportReadinessService


router = APIRouter()


@router.get("/orders", response_model=list[ExportOrderRead], dependencies=[require_permission("export.manage")])
async def list_orders(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[ExportOrderRead]:
    orders = await ExportService(session).list_orders(org_id=auth.org_id, limit=limit, offset=offset)
    return [ExportOrderRead.model_validate(o) for o in orders]


@router.post("/orders", response_model=ExportOrderRead, status_code=201, dependencies=[require_permission("export.manage")])
async def create_order(payload: ExportOrderCreate, session: DbSession, auth: CurrentAuth) -> ExportOrderRead:
    order = await ExportService(session).create_order(org_id=auth.org_id, data=payload.model_dump())
    return ExportOrderRead.model_validate(order)


@router.patch("/orders/{order_id}", response_model=ExportOrderRead, dependencies=[require_permission("export.manage")])
async def update_order(order_id: str, payload: ExportOrderUpdate, session: DbSession, auth: CurrentAuth) -> ExportOrderRead:
    order = await ExportService(session).update_order(org_id=auth.org_id, order_id=order_id, data=payload.model_dump())
    return ExportOrderRead.model_validate(order)


@router.get("/shipments", response_model=list[ShipmentRead], dependencies=[require_permission("export.manage")])
async def list_shipments(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[ShipmentRead]:
    shipments = await ExportService(session).list_shipments(org_id=auth.org_id, limit=limit, offset=offset)
    return [ShipmentRead.model_validate(s) for s in shipments]


@router.post("/shipments", response_model=ShipmentRead, status_code=201, dependencies=[require_permission("export.manage")])
async def create_shipment(payload: ShipmentCreate, session: DbSession, auth: CurrentAuth) -> ShipmentRead:
    ship = await ExportService(session).create_shipment(org_id=auth.org_id, data=payload.model_dump())
    return ShipmentRead.model_validate(ship)


@router.post("/documents", response_model=ExportDocumentRead, status_code=202, dependencies=[require_permission("export.manage")])
async def request_document(payload: DocumentRequest, session: DbSession, auth: CurrentAuth) -> ExportDocumentRead:
    doc = await ExportService(session).request_document(
        org_id=auth.org_id, export_order_id=payload.export_order_id, kind=payload.kind
    )
    return ExportDocumentRead.model_validate(doc)


@router.get("/documents/{export_order_id}", response_model=list[ExportDocumentRead], dependencies=[require_permission("export.manage")])
async def list_documents(export_order_id: str, session: DbSession, auth: CurrentAuth) -> list[ExportDocumentRead]:
    docs = await ExportService(session).list_documents(org_id=auth.org_id, export_order_id=export_order_id)
    return [ExportDocumentRead.model_validate(d) for d in docs]


@router.get("/document/{document_id}", response_model=ExportDocumentContent, dependencies=[require_permission("export.manage")])
async def document_content(document_id: str, session: DbSession, auth: CurrentAuth) -> ExportDocumentContent:
    doc = await ExportService(session).get_document_content(org_id=auth.org_id, document_id=document_id)
    return ExportDocumentContent(
        id=doc.id,
        status=doc.status,
        content_type=getattr(doc, "content_type", "text/plain") or "text/plain",
        encoding=getattr(doc, "encoding", "utf-8") or "utf-8",
        file_name=getattr(doc, "file_name", "") or "",
        content=doc.content or "",
    )


@router.get("/readiness", response_model=ExportReadinessScore, dependencies=[require_permission("export.manage")])
async def export_readiness(session: DbSession, auth: CurrentAuth) -> ExportReadinessScore:
    data = await ExportReadinessService(session).score(org_id=auth.org_id)
    return ExportReadinessScore(**data)
