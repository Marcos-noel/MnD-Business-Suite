from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi_cache.decorator import cache
from fastapi.responses import Response
from pydantic import BaseModel

from app.api.v1.routes._auth_deps import CurrentAuth
from app.api.v1.routes._permissions import require_any_permission, require_permission
from app.core.deps import DbSession
from app.core.cache_key import org_cache_key_builder
from app.models.inventory.category import ProductCategory
from app.models.inventory.product import Product
from app.models.commerce.shipping import ShippingZone, ShippingRate, TaxRate
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


# ============ Category Schemas ============

class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    image_url: str = ""
    parent_id: str | None = None
    is_active: bool = True
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    image_url: str | None = None
    parent_id: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class CategoryRead(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    image_url: str
    parent_id: str | None
    is_active: bool
    sort_order: int


# ============ Category Endpoints ============


@router.get(
    "/categories",
    response_model=list[CategoryRead],
    dependencies=[require_any_permission("inventory.manage", "inventory.read")],
)
async def list_categories(session: DbSession, auth: CurrentAuth) -> list[CategoryRead]:
    from sqlalchemy import select
    
    cats = await session.execute(
        select(ProductCategory)
        .where(ProductCategory.org_id == auth.org_id)
        .order_by(ProductCategory.sort_order.asc(), ProductCategory.name.asc())
    )
    return [CategoryRead(
        id=c.id,
        name=c.name,
        slug=c.slug,
        description=c.description,
        image_url=c.image_url,
        parent_id=c.parent_id,
        is_active=c.is_active,
        sort_order=c.sort_order,
    ) for c in cats.scalars().all()]


@router.post("/categories", response_model=CategoryRead, status_code=201, dependencies=[require_permission("inventory.manage")])
async def create_category(payload: CategoryCreate, session: DbSession, auth: CurrentAuth) -> CategoryRead:
    from sqlalchemy import select
    from app.models.tenancy.organization import Organization
    
    # Verify org exists
    org = await session.get(Organization, auth.org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Check for duplicate slug
    existing = await session.execute(
        select(ProductCategory).where(
            ProductCategory.org_id == auth.org_id,
            ProductCategory.slug == payload.slug
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Category slug already exists")
    
    cat = ProductCategory(
        id=payload.id if hasattr(payload, 'id') and payload.id else None,
        org_id=auth.org_id,
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        image_url=payload.image_url,
        parent_id=payload.parent_id,
        is_active=payload.is_active,
        sort_order=payload.sort_order,
    )
    session.add(cat)
    await session.commit()
    await session.refresh(cat)
    
    return CategoryRead(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        image_url=cat.image_url,
        parent_id=cat.parent_id,
        is_active=cat.is_active,
        sort_order=cat.sort_order,
    )


@router.get("/categories/{category_id}", response_model=CategoryRead, dependencies=[require_any_permission("inventory.manage", "inventory.read")])
async def get_category(category_id: str, session: DbSession, auth: CurrentAuth) -> CategoryRead:
    from sqlalchemy import select
    
    cat = await session.get(ProductCategory, category_id)
    if not cat or cat.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return CategoryRead(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        image_url=cat.image_url,
        parent_id=cat.parent_id,
        is_active=cat.is_active,
        sort_order=cat.sort_order,
    )


@router.patch("/categories/{category_id}", response_model=CategoryRead, dependencies=[require_permission("inventory.manage")])
async def update_category(category_id: str, payload: CategoryUpdate, session: DbSession, auth: CurrentAuth) -> CategoryRead:
    from sqlalchemy import select
    
    cat = await session.get(ProductCategory, category_id)
    if not cat or cat.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if payload.name is not None:
        cat.name = payload.name
    if payload.slug is not None:
        cat.slug = payload.slug
    if payload.description is not None:
        cat.description = payload.description
    if payload.image_url is not None:
        cat.image_url = payload.image_url
    if payload.parent_id is not None:
        cat.parent_id = payload.parent_id
    if payload.is_active is not None:
        cat.is_active = payload.is_active
    if payload.sort_order is not None:
        cat.sort_order = payload.sort_order
    
    await session.commit()
    await session.refresh(cat)
    
    return CategoryRead(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        image_url=cat.image_url,
        parent_id=cat.parent_id,
        is_active=cat.is_active,
        sort_order=cat.sort_order,
    )


@router.delete("/categories/{category_id}", status_code=204, dependencies=[require_permission("inventory.manage")], response_class=Response)
async def delete_category(category_id: str, session: DbSession, auth: CurrentAuth) -> Response:
    cat = await session.get(ProductCategory, category_id)
    if not cat or cat.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category has products
    from sqlalchemy import select, func
    from app.models.inventory.product import Product
    
    product_count = await session.execute(
        select(func.count()).select_from(Product).where(
            Product.category_id == category_id,
            Product.org_id == auth.org_id
        )
    )
    if product_count.scalar() > 0:
        raise HTTPException(status_code=400, detail="Cannot delete category with products")
    
    await session.delete(cat)
    await session.commit()
    return Response(status_code=204)



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


# ============ Product Variants ============


class VariantCreate(BaseModel):
    product_id: str
    sku: str
    name: str
    description: str = ""
    image_url: str = ""
    price: float = 0
    compare_at_price: float = 0
    cost_per_item: float = 0
    inventory_quantity: int = 0
    inventory_policy: str = "deny"
    track_inventory: bool = True
    is_active: bool = True
    sort_order: int = 0
    options: dict = {}


class VariantUpdate(BaseModel):
    sku: str | None = None
    name: str | None = None
    description: str | None = None
    image_url: str | None = None
    price: float | None = None
    compare_at_price: float | None = None
    cost_per_item: float | None = None
    inventory_quantity: int | None = None
    inventory_policy: str | None = None
    track_inventory: bool | None = None
    is_active: bool | None = None
    sort_order: int | None = None
    options: dict | None = None


class VariantRead(BaseModel):
    id: str
    product_id: str
    sku: str
    name: str
    description: str
    image_url: str
    price: float
    compare_at_price: float
    cost_per_item: float
    inventory_quantity: int
    inventory_policy: str
    track_inventory: bool
    is_active: bool
    sort_order: int
    options: dict


@router.get(
    "/products/{product_id}/variants",
    response_model=list[VariantRead],
    dependencies=[require_any_permission("inventory.manage", "inventory.read")],
)
async def list_variants(product_id: str, session: DbSession, auth: CurrentAuth) -> list[VariantRead]:
    from sqlalchemy import select
    from app.models.inventory.product_variant import ProductVariant
    
    variants = await session.execute(
        select(ProductVariant)
        .where(ProductVariant.product_id == product_id)
        .where(ProductVariant.org_id == auth.org_id)
        .order_by(ProductVariant.sort_order.asc())
    )
    return [VariantRead(
        id=v.id,
        product_id=v.product_id,
        sku=v.sku,
        name=v.name,
        description=v.description,
        image_url=v.image_url,
        price=float(v.price),
        compare_at_price=float(v.compare_at_price),
        cost_per_item=float(v.cost_per_item),
        inventory_quantity=v.inventory_quantity,
        inventory_policy=v.inventory_policy,
        track_inventory=v.track_inventory,
        is_active=v.is_active,
        sort_order=v.sort_order,
        options=v.options if isinstance(v.options, dict) else {},
    ) for v in variants.scalars().all()]


@router.post(
    "/products/{product_id}/variants",
    response_model=VariantRead,
    status_code=201,
    dependencies=[require_permission("inventory.manage")],
)
async def create_variant(product_id: str, payload: VariantCreate, session: DbSession, auth: CurrentAuth) -> VariantRead:
    import uuid
    from app.models.inventory.product_variant import ProductVariant
    
    # Verify product exists
    product = await session.get(Product, product_id)
    if not product or product.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Product not found")
    
    variant = ProductVariant(
        id=str(uuid.uuid4()),
        org_id=auth.org_id,
        product_id=product_id,
        sku=payload.sku,
        name=payload.name,
        description=payload.description,
        image_url=payload.image_url,
        price=payload.price,
        compare_at_price=payload.compare_at_price,
        cost_per_item=payload.cost_per_item,
        inventory_quantity=payload.inventory_quantity,
        inventory_policy=payload.inventory_policy,
        track_inventory=payload.track_inventory,
        is_active=payload.is_active,
        sort_order=payload.sort_order,
        options=str(payload.options),
    )
    session.add(variant)
    await session.commit()
    await session.refresh(variant)
    
    return VariantRead(
        id=variant.id,
        product_id=variant.product_id,
        sku=variant.sku,
        name=variant.name,
        description=variant.description,
        image_url=variant.image_url,
        price=float(variant.price),
        compare_at_price=float(variant.compare_at_price),
        cost_per_item=float(variant.cost_per_item),
        inventory_quantity=variant.inventory_quantity,
        inventory_policy=variant.inventory_policy,
        track_inventory=variant.track_inventory,
        is_active=variant.is_active,
        sort_order=variant.sort_order,
        options={},
    )


@router.get(
    "/variants/{variant_id}",
    response_model=VariantRead,
    dependencies=[require_any_permission("inventory.manage", "inventory.read")],
)
async def get_variant(variant_id: str, session: DbSession, auth: CurrentAuth) -> VariantRead:
    from app.models.inventory.product_variant import ProductVariant
    
    variant = await session.get(ProductVariant, variant_id)
    if not variant or variant.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Variant not found")
    
    return VariantRead(
        id=variant.id,
        product_id=variant.product_id,
        sku=variant.sku,
        name=variant.name,
        description=variant.description,
        image_url=variant.image_url,
        price=float(variant.price),
        compare_at_price=float(variant.compare_at_price),
        cost_per_item=float(variant.cost_per_item),
        inventory_quantity=variant.inventory_quantity,
        inventory_policy=variant.inventory_policy,
        track_inventory=variant.track_inventory,
        is_active=variant.is_active,
        sort_order=variant.sort_order,
        options={},
    )


@router.patch(
    "/variants/{variant_id}",
    response_model=VariantRead,
    dependencies=[require_permission("inventory.manage")],
)
async def update_variant(variant_id: str, payload: VariantUpdate, session: DbSession, auth: CurrentAuth) -> VariantRead:
    from app.models.inventory.product_variant import ProductVariant
    
    variant = await session.get(ProductVariant, variant_id)
    if not variant or variant.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Variant not found")
    
    if payload.sku is not None:
        variant.sku = payload.sku
    if payload.name is not None:
        variant.name = payload.name
    if payload.description is not None:
        variant.description = payload.description
    if payload.image_url is not None:
        variant.image_url = payload.image_url
    if payload.price is not None:
        variant.price = payload.price
    if payload.compare_at_price is not None:
        variant.compare_at_price = payload.compare_at_price
    if payload.cost_per_item is not None:
        variant.cost_per_item = payload.cost_per_item
    if payload.inventory_quantity is not None:
        variant.inventory_quantity = payload.inventory_quantity
    if payload.inventory_policy is not None:
        variant.inventory_policy = payload.inventory_policy
    if payload.track_inventory is not None:
        variant.track_inventory = payload.track_inventory
    if payload.is_active is not None:
        variant.is_active = payload.is_active
    if payload.sort_order is not None:
        variant.sort_order = payload.sort_order
    if payload.options is not None:
        variant.options = str(payload.options)
    
    await session.commit()
    await session.refresh(variant)
    
    return VariantRead(
        id=variant.id,
        product_id=variant.product_id,
        sku=variant.sku,
        name=variant.name,
        description=variant.description,
        image_url=variant.image_url,
        price=float(variant.price),
        compare_at_price=float(variant.compare_at_price),
        cost_per_item=float(variant.cost_per_item),
        inventory_quantity=variant.inventory_quantity,
        inventory_policy=variant.inventory_policy,
        track_inventory=variant.track_inventory,
        is_active=variant.is_active,
        sort_order=variant.sort_order,
        options={},
    )


@router.delete(
    "/variants/{variant_id}",
    status_code=204,
    dependencies=[require_permission("inventory.manage")],
    response_class=Response,
)
async def delete_variant(variant_id: str, session: DbSession, auth: CurrentAuth) -> Response:
    from app.models.inventory.product_variant import ProductVariant
    
    variant = await session.get(ProductVariant, variant_id)
    if not variant or variant.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Variant not found")
    
    await session.delete(variant)
    await session.commit()
    return Response(status_code=204)


# ============ Shipping Zone Schemas ============


class ShippingZoneCreate(BaseModel):
    name: str
    countries: str = ""
    regions: str = ""
    is_active: bool = True
    sort_order: int = 0


class ShippingZoneUpdate(BaseModel):
    name: str | None = None
    countries: str | None = None
    regions: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class ShippingZoneRead(BaseModel):
    id: str
    name: str
    countries: str
    regions: str
    is_active: bool
    sort_order: int


class ShippingRateCreate(BaseModel):
    zone_id: str
    name: str
    description: str = ""
    price: float
    free_shipping_threshold: float = 0
    min_weight: float = 0
    max_weight: float = 0
    estimated_days_min: int = 1
    estimated_days_max: int = 3
    is_active: bool = True
    sort_order: int = 0


class ShippingRateUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    free_shipping_threshold: float | None = None
    min_weight: float | None = None
    max_weight: float | None = None
    estimated_days_min: int | None = None
    estimated_days_max: int | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class ShippingRateRead(BaseModel):
    id: str
    zone_id: str
    name: str
    description: str
    price: float
    free_shipping_threshold: float
    min_weight: float
    max_weight: float
    estimated_days_min: int
    estimated_days_max: int
    is_active: bool
    sort_order: int


class TaxRateCreate(BaseModel):
    name: str
    country: str = "KEN"
    region: str = ""
    rate: float
    is_active: bool = True
    sort_order: int = 0


class TaxRateUpdate(BaseModel):
    name: str | None = None
    country: str | None = None
    region: str | None = None
    rate: float | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class TaxRateRead(BaseModel):
    id: str
    name: str
    country: str
    region: str
    rate: float
    is_active: bool
    sort_order: int


# ============ Shipping Zone Endpoints ============


@router.get(
    "/shipping/zones",
    response_model=list[ShippingZoneRead],
    dependencies=[require_any_permission("inventory.manage", "inventory.read")],
)
async def list_shipping_zones(session: DbSession, auth: CurrentAuth) -> list[ShippingZoneRead]:
    from sqlalchemy import select
    result = await session.execute(
        select(ShippingZone)
        .where(ShippingZone.org_id == auth.org_id)
        .order_by(ShippingZone.sort_order, ShippingZone.name)
    )
    zones = result.scalars().all()
    return [
        ShippingZoneRead(
            id=z.id,
            name=z.name,
            countries=z.countries,
            regions=z.regions,
            is_active=z.is_active,
            sort_order=z.sort_order,
        )
        for z in zones
    ]


@router.post(
    "/shipping/zones",
    response_model=ShippingZoneRead,
    status_code=201,
    dependencies=[require_permission("inventory.manage")],
)
async def create_shipping_zone(
    payload: ShippingZoneCreate,
    session: DbSession,
    auth: CurrentAuth,
) -> ShippingZoneRead:
    zone = ShippingZone(
        org_id=auth.org_id,
        name=payload.name,
        countries=payload.countries,
        regions=payload.regions,
        is_active=payload.is_active,
        sort_order=payload.sort_order,
    )
    session.add(zone)
    await session.commit()
    await session.refresh(zone)
    return ShippingZoneRead(
        id=zone.id,
        name=zone.name,
        countries=zone.countries,
        regions=zone.regions,
        is_active=zone.is_active,
        sort_order=zone.sort_order,
    )


@router.get(
    "/shipping/zones/{zone_id}",
    response_model=ShippingZoneRead,
    dependencies=[require_any_permission("inventory.manage", "inventory.read")],
)
async def get_shipping_zone(zone_id: str, session: DbSession, auth: CurrentAuth) -> ShippingZoneRead:
    zone = await session.get(ShippingZone, zone_id)
    if not zone or zone.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Shipping zone not found")
    return ShippingZoneRead(
        id=zone.id,
        name=zone.name,
        countries=zone.countries,
        regions=zone.regions,
        is_active=zone.is_active,
        sort_order=zone.sort_order,
    )


@router.patch(
    "/shipping/zones/{zone_id}",
    response_model=ShippingZoneRead,
    dependencies=[require_permission("inventory.manage")],
)
async def update_shipping_zone(
    zone_id: str,
    payload: ShippingZoneUpdate,
    session: DbSession,
    auth: CurrentAuth,
) -> ShippingZoneRead:
    zone = await session.get(ShippingZone, zone_id)
    if not zone or zone.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Shipping zone not found")
    
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(zone, field, value)
    
    await session.commit()
    await session.refresh(zone)
    return ShippingZoneRead(
        id=zone.id,
        name=zone.name,
        countries=zone.countries,
        regions=zone.regions,
        is_active=zone.is_active,
        sort_order=zone.sort_order,
    )


@router.delete(
    "/shipping/zones/{zone_id}",
    status_code=204,
    dependencies=[require_permission("inventory.manage")],
    response_class=Response,
)
async def delete_shipping_zone(zone_id: str, session: DbSession, auth: CurrentAuth) -> Response:
    zone = await session.get(ShippingZone, zone_id)
    if not zone or zone.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Shipping zone not found")
    
    await session.delete(zone)
    await session.commit()
    return Response(status_code=204)


# ============ Shipping Rate Endpoints ============


@router.get(
    "/shipping/rates",
    response_model=list[ShippingRateRead],
    dependencies=[require_any_permission("inventory.manage", "inventory.read")],
)
async def list_shipping_rates(
    session: DbSession,
    auth: CurrentAuth,
    zone_id: str | None = None,
) -> list[ShippingRateRead]:
    from sqlalchemy import select
    query = select(ShippingRate).where(ShippingRate.org_id == auth.org_id)
    if zone_id:
        query = query.where(ShippingRate.zone_id == zone_id)
    result = await session.execute(query.order_by(ShippingRate.sort_order, ShippingRate.name))
    rates = result.scalars().all()
    return [
        ShippingRateRead(
            id=r.id,
            zone_id=r.zone_id,
            name=r.name,
            description=r.description,
            price=float(r.price),
            free_shipping_threshold=float(r.free_shipping_threshold),
            min_weight=float(r.min_weight),
            max_weight=float(r.max_weight),
            estimated_days_min=r.estimated_days_min,
            estimated_days_max=r.estimated_days_max,
            is_active=r.is_active,
            sort_order=r.sort_order,
        )
        for r in rates
    ]


@router.post(
    "/shipping/rates",
    response_model=ShippingRateRead,
    status_code=201,
    dependencies=[require_permission("inventory.manage")],
)
async def create_shipping_rate(
    payload: ShippingRateCreate,
    session: DbSession,
    auth: CurrentAuth,
) -> ShippingRateRead:
    rate = ShippingRate(
        org_id=auth.org_id,
        zone_id=payload.zone_id,
        name=payload.name,
        description=payload.description,
        price=payload.price,
        free_shipping_threshold=payload.free_shipping_threshold,
        min_weight=payload.min_weight,
        max_weight=payload.max_weight,
        estimated_days_min=payload.estimated_days_min,
        estimated_days_max=payload.estimated_days_max,
        is_active=payload.is_active,
        sort_order=payload.sort_order,
    )
    session.add(rate)
    await session.commit()
    await session.refresh(rate)
    return ShippingRateRead(
        id=rate.id,
        zone_id=rate.zone_id,
        name=rate.name,
        description=rate.description,
        price=float(rate.price),
        free_shipping_threshold=float(rate.free_shipping_threshold),
        min_weight=float(rate.min_weight),
        max_weight=float(rate.max_weight),
        estimated_days_min=rate.estimated_days_min,
        estimated_days_max=rate.estimated_days_max,
        is_active=rate.is_active,
        sort_order=rate.sort_order,
    )


@router.get(
    "/shipping/rates/{rate_id}",
    response_model=ShippingRateRead,
    dependencies=[require_any_permission("inventory.manage", "inventory.read")],
)
async def get_shipping_rate(rate_id: str, session: DbSession, auth: CurrentAuth) -> ShippingRateRead:
    rate = await session.get(ShippingRate, rate_id)
    if not rate or rate.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Shipping rate not found")
    return ShippingRateRead(
        id=rate.id,
        zone_id=rate.zone_id,
        name=rate.name,
        description=rate.description,
        price=float(rate.price),
        free_shipping_threshold=float(rate.free_shipping_threshold),
        min_weight=float(rate.min_weight),
        max_weight=float(rate.max_weight),
        estimated_days_min=rate.estimated_days_min,
        estimated_days_max=rate.estimated_days_max,
        is_active=rate.is_active,
        sort_order=rate.sort_order,
    )


@router.patch(
    "/shipping/rates/{rate_id}",
    response_model=ShippingRateRead,
    dependencies=[require_permission("inventory.manage")],
)
async def update_shipping_rate(
    rate_id: str,
    payload: ShippingRateUpdate,
    session: DbSession,
    auth: CurrentAuth,
) -> ShippingRateRead:
    rate = await session.get(ShippingRate, rate_id)
    if not rate or rate.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Shipping rate not found")
    
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(rate, field, value)
    
    await session.commit()
    await session.refresh(rate)
    return ShippingRateRead(
        id=rate.id,
        zone_id=rate.zone_id,
        name=rate.name,
        description=rate.description,
        price=float(rate.price),
        free_shipping_threshold=float(rate.free_shipping_threshold),
        min_weight=float(rate.min_weight),
        max_weight=float(rate.max_weight),
        estimated_days_min=rate.estimated_days_min,
        estimated_days_max=rate.estimated_days_max,
        is_active=rate.is_active,
        sort_order=rate.sort_order,
    )


@router.delete(
    "/shipping/rates/{rate_id}",
    status_code=204,
    dependencies=[require_permission("inventory.manage")],
    response_class=Response,
)
async def delete_shipping_rate(rate_id: str, session: DbSession, auth: CurrentAuth) -> Response:
    rate = await session.get(ShippingRate, rate_id)
    if not rate or rate.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Shipping rate not found")
    
    await session.delete(rate)
    await session.commit()
    return Response(status_code=204)


# ============ Tax Rate Endpoints ============


@router.get(
    "/tax-rates",
    response_model=list[TaxRateRead],
    dependencies=[require_any_permission("inventory.manage", "inventory.read")],
)
async def list_tax_rates(session: DbSession, auth: CurrentAuth) -> list[TaxRateRead]:
    from sqlalchemy import select
    result = await session.execute(
        select(TaxRate)
        .where(TaxRate.org_id == auth.org_id)
        .order_by(TaxRate.sort_order, TaxRate.name)
    )
    rates = result.scalars().all()
    return [
        TaxRateRead(
            id=r.id,
            name=r.name,
            country=r.country,
            region=r.region,
            rate=float(r.rate),
            is_active=r.is_active,
            sort_order=r.sort_order,
        )
        for r in rates
    ]


@router.post(
    "/tax-rates",
    response_model=TaxRateRead,
    status_code=201,
    dependencies=[require_permission("inventory.manage")],
)
async def create_tax_rate(
    payload: TaxRateCreate,
    session: DbSession,
    auth: CurrentAuth,
) -> TaxRateRead:
    tax = TaxRate(
        org_id=auth.org_id,
        name=payload.name,
        country=payload.country,
        region=payload.region,
        rate=payload.rate,
        is_active=payload.is_active,
        sort_order=payload.sort_order,
    )
    session.add(tax)
    await session.commit()
    await session.refresh(tax)
    return TaxRateRead(
        id=tax.id,
        name=tax.name,
        country=tax.country,
        region=tax.region,
        rate=float(tax.rate),
        is_active=tax.is_active,
        sort_order=tax.sort_order,
    )


@router.get(
    "/tax-rates/{tax_id}",
    response_model=TaxRateRead,
    dependencies=[require_any_permission("inventory.manage", "inventory.read")],
)
async def get_tax_rate(tax_id: str, session: DbSession, auth: CurrentAuth) -> TaxRateRead:
    tax = await session.get(TaxRate, tax_id)
    if not tax or tax.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Tax rate not found")
    return TaxRateRead(
        id=tax.id,
        name=tax.name,
        country=tax.country,
        region=tax.region,
        rate=float(tax.rate),
        is_active=tax.is_active,
        sort_order=tax.sort_order,
    )


@router.patch(
    "/tax-rates/{tax_id}",
    response_model=TaxRateRead,
    dependencies=[require_permission("inventory.manage")],
)
async def update_tax_rate(
    tax_id: str,
    payload: TaxRateUpdate,
    session: DbSession,
    auth: CurrentAuth,
) -> TaxRateRead:
    tax = await session.get(TaxRate, tax_id)
    if not tax or tax.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Tax rate not found")
    
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(tax, field, value)
    
    await session.commit()
    await session.refresh(tax)
    return TaxRateRead(
        id=tax.id,
        name=tax.name,
        country=tax.country,
        region=tax.region,
        rate=float(tax.rate),
        is_active=tax.is_active,
        sort_order=tax.sort_order,
    )


@router.delete(
    "/tax-rates/{tax_id}",
    status_code=204,
    dependencies=[require_permission("inventory.manage")],
    response_class=Response,
)
async def delete_tax_rate(tax_id: str, session: DbSession, auth: CurrentAuth) -> Response:
    tax = await session.get(TaxRate, tax_id)
    if not tax or tax.org_id != auth.org_id:
        raise HTTPException(status_code=404, detail="Tax rate not found")
    
    await session.delete(tax)
    await session.commit()
    return Response(status_code=204)


# ============ Calculate Shipping & Tax ============


class CalculateShippingRequest(BaseModel):
    zone_id: str
    subtotal: float
    weight: float = 0


class CalculateShippingResponse(BaseModel):
    available_rates: list[ShippingRateRead]
    free_shipping_available: bool
    free_shipping_threshold: float | None


class CalculateTaxRequest(BaseModel):
    country: str
    region: str = ""
    subtotal: float


class CalculateTaxResponse(BaseModel):
    applicable_tax: TaxRateRead | None
    tax_amount: float
    total: float


@router.post(
    "/shipping/calculate",
    response_model=CalculateShippingResponse,
)
async def calculate_shipping(
    payload: CalculateShippingRequest,
    session: DbSession,
    auth: CurrentAuth,
) -> CalculateShippingResponse:
    from sqlalchemy import select
    result = await session.execute(
        select(ShippingRate)
        .where(
            ShippingRate.org_id == auth.org_id,
            ShippingRate.zone_id == payload.zone_id,
            ShippingRate.is_active == True,
        )
        .order_by(ShippingRate.price)
    )
    rates = result.scalars().all()
    
    available = []
    free_threshold = None
    
    for r in rates:
        # Check weight constraints
        if payload.weight > 0:
            if r.min_weight > 0 and payload.weight < r.min_weight:
                continue
            if r.max_weight > 0 and payload.weight > r.max_weight:
                continue
        
        # Check free shipping threshold
        if payload.subtotal >= float(r.free_shipping_threshold) and r.free_shipping_threshold > 0:
            if free_threshold is None or float(r.free_shipping_threshold) < free_threshold:
                free_threshold = float(r.free_shipping_threshold)
        
        available.append(ShippingRateRead(
            id=r.id,
            zone_id=r.zone_id,
            name=r.name,
            description=r.description,
            price=float(r.price),
            free_shipping_threshold=float(r.free_shipping_threshold),
            min_weight=float(r.min_weight),
            max_weight=float(r.max_weight),
            estimated_days_min=r.estimated_days_min,
            estimated_days_max=r.estimated_days_max,
            is_active=r.is_active,
            sort_order=r.sort_order,
        ))
    
    return CalculateShippingResponse(
        available_rates=available,
        free_shipping_available=free_threshold is not None and payload.subtotal >= free_threshold,
        free_shipping_threshold=free_threshold,
    )


@router.post(
    "/tax/calculate",
    response_model=CalculateTaxResponse,
)
async def calculate_tax(
    payload: CalculateTaxRequest,
    session: DbSession,
    auth: CurrentAuth,
) -> CalculateTaxResponse:
    from sqlalchemy import select
    result = await session.execute(
        select(TaxRate)
        .where(
            TaxRate.org_id == auth.org_id,
            TaxRate.country == payload.country,
            TaxRate.is_active == True,
        )
        .order_by(TaxRate.sort_order.desc(), TaxRate.rate.desc())
    )
    tax_rates = result.scalars().all()
    
    applicable = None
    tax_amount = 0
    
    for tax in tax_rates:
        # Try exact region match first
        if tax.region and tax.region == payload.region:
            applicable = tax
            tax_amount = payload.subtotal * float(tax.rate) / 100
            break
        # Fall back to country-wide rate
        elif not tax.region:
            if applicable is None:
                applicable = tax
                tax_amount = payload.subtotal * float(tax.rate) / 100
    
    return CalculateTaxResponse(
        applicable_tax=TaxRateRead(
            id=applicable.id,
            name=applicable.name,
            country=applicable.country,
            region=applicable.region,
            rate=float(applicable.rate),
            is_active=applicable.is_active,
            sort_order=applicable.sort_order,
        ) if applicable else None,
        tax_amount=tax_amount,
        total=payload.subtotal + tax_amount,
    )
