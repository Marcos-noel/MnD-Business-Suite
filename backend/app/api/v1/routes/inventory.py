from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import Response

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_any_permission, require_permission
from app.core.deps import DbSession
from app.repositories.inventory.product import ProductRepository
from app.schemas.inventory.product import (
    ProductCreate,
    ProductRead,
    ProductUpdate,
    StockLevel,
    StockMovementCreate,
)
from app.schemas.inventory.supplier import SupplierCreate, SupplierRead
from app.services.inventory.inventory_service import InventoryService
from app.utils.qr import make_qr_svg


router = APIRouter()


@router.get(
    "/suppliers",
    response_model=list[SupplierRead],
    dependencies=[require_any_permission("inventory.manage", "inventory.read")],
)
async def list_suppliers(session: DbSession, auth: CurrentAuth, limit: int = 50, offset: int = 0) -> list[SupplierRead]:
    items = await InventoryService(session).list_suppliers(org_id=auth.org_id, limit=limit, offset=offset)
    return [SupplierRead.model_validate(i) for i in items]


@router.post("/suppliers", response_model=SupplierRead, status_code=201, dependencies=[require_permission("inventory.manage")])
async def create_supplier(payload: SupplierCreate, session: DbSession, auth: CurrentAuth) -> SupplierRead:
    sup = await InventoryService(session).create_supplier(org_id=auth.org_id, data=payload.model_dump())
    return SupplierRead.model_validate(sup)


@router.get(
    "/products",
    response_model=list[ProductRead],
    dependencies=[require_any_permission("inventory.manage", "inventory.read")],
)
async def list_products(
    session: DbSession,
    auth: CurrentAuth,
    limit: int = 50,
    offset: int = 0
) -> list[ProductRead]:
    try:
        items = await InventoryService(session).list_products(
            org_id=auth.org_id, limit=limit, offset=offset
        )
        return [ProductRead.model_validate(i) for i in items]
    except Exception:
        return []


@router.post("/products", response_model=ProductRead, status_code=201, dependencies=[require_permission("inventory.manage")])
async def create_product(payload: ProductCreate, session: DbSession, auth: CurrentAuth) -> ProductRead:
    product = await InventoryService(session).create_product(org_id=auth.org_id, data=payload.model_dump())
    return ProductRead.model_validate(product)


@router.patch("/products/{product_id}", response_model=ProductRead, dependencies=[require_permission("inventory.manage")])
async def update_product(product_id: str, payload: ProductUpdate, session: DbSession, auth: CurrentAuth) -> ProductRead:
    product = await InventoryService(session).update_product(org_id=auth.org_id, product_id=product_id, data=payload.model_dump())
    return ProductRead.model_validate(product)


@router.get(
    "/products/{product_id}/qr",
    response_class=Response,
    dependencies=[require_any_permission("inventory.manage", "inventory.read")],
)
async def product_qr(product_id: str, session: DbSession, auth: CurrentAuth) -> Response:
    product = await ProductRepository(session).get(org_id=auth.org_id, id=product_id)
    payload = "\n".join(["MND PRODUCT", f"SKU:{product.sku}", f"NAME:{product.name}"])
    svg = make_qr_svg(data=payload, size=260)
    return Response(content=svg, media_type="image/svg+xml")


@router.post("/stock/movements", status_code=201, dependencies=[require_permission("inventory.manage")])
async def record_movement(payload: StockMovementCreate, session: DbSession, auth: CurrentAuth) -> dict:
    mv = await InventoryService(session).record_stock_movement(
        org_id=auth.org_id,
        product_id=payload.product_id,
        quantity_delta=payload.quantity_delta,
        reason=payload.reason,
    )
    return {"id": mv.id}


@router.get(
    "/stock/levels",
    response_model=list[StockLevel],
    dependencies=[require_any_permission("inventory.manage", "inventory.read")],
)
async def stock_levels(session: DbSession, auth: CurrentAuth) -> list[StockLevel]:
    rows = await InventoryService(session).stock_levels(org_id=auth.org_id)
    return [StockLevel(**r) for r in rows]
