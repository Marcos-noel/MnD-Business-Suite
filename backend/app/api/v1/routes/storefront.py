from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy import select, delete

from app.core.deps import DbSession
from app.core.security import create_access_token
from app.api.v1.routes._auth_deps import CurrentAuth
from app.models.commerce.cart import Cart, CartItem
from app.models.commerce.wishlist import Wishlist
from app.models.commerce.order import CommerceOrder
from app.models.inventory.category import ProductCategory
from app.models.inventory.product import Product
from app.models.inventory.product_variant import ProductVariant
from app.models.tenancy.organization import Organization
from app.repositories.tenancy.organization import OrganizationRepository
from app.schemas.commerce.order import StorefrontCheckoutRequest, StorefrontProductRead
from app.services.commerce.commerce_service import CommerceService


router = APIRouter()


# ============ Schemas ============

class CategoryRead(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    image_url: str
    is_active: bool
    product_count: int = 0


class ProductVariantRead(BaseModel):
    id: str
    sku: str
    name: str
    description: str
    image_url: str
    price: float
    compare_at_price: float
    inventory_quantity: int
    options: dict


class ProductDetailRead(BaseModel):
    id: str
    sku: str
    name: str
    description: str
    image_url: str
    sell_price: float
    compare_at_price: float
    currency: str
    category: Optional[CategoryRead] = None
    variants: list[ProductVariantRead] = []
    tags: list[str] = []
    meta_title: str
    meta_description: str


class CartItemRead(BaseModel):
    id: str
    product_id: str
    product_name: str
    variant_id: Optional[str] = None
    variant_name: Optional[str] = None
    image_url: str
    price: float
    quantity: int
    line_total: float


class CartRead(BaseModel):
    id: str
    items: list[CartItemRead] = []
    item_count: int = 0
    subtotal: float = 0
    currency: str = "KES"


class ShippingAddress(BaseModel):
    name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str = "KEN"


class CartUpdateRequest(BaseModel):
    product_id: str
    variant_id: Optional[str] = None
    quantity: int = 1


class CheckoutRequest(BaseModel):
    cart_id: str
    customer_name: str
    customer_email: EmailStr
    shipping_address: ShippingAddress
    provider: str = "stripe"
    reference: str = ""


class OrderRead(BaseModel):
    id: str
    order_no: str
    customer_name: str
    customer_email: str
    status: str
    payment_status: str
    total: float
    currency: str
    created_at: str
    items: list[dict] = []


class WishlistItemRead(BaseModel):
    id: str
    product_id: str
    product_name: str
    sku: str
    price: float
    currency: str
    image_url: Optional[str] = None
    added_at: str


class WishlistRead(BaseModel):
    items: list[WishlistItemRead] = []


# ============ Helper Functions ============

async def _get_org_or_404(session: DbSession, org_slug: str) -> Organization:
    org = await OrganizationRepository(session).get_by_slug(org_slug)
    if not org:
        raise HTTPException(status_code=404, detail="Store not found")
    return org


async def _get_cart_with_items(session: DbSession, cart_id: str, org_id: str) -> Optional[Cart]:
    cart = await session.get(Cart, cart_id)
    if not cart or cart.org_id != org_id:
        return None
    
    items = await session.execute(
        select(CartItem).where(CartItem.cart_id == cart_id)
    )
    cart.items = list(items.scalars().all())
    return cart


# ============ Categories ============

@router.get("/store/{org_slug}/categories", response_model=list[CategoryRead])
async def list_categories(org_slug: str, session: DbSession) -> list[CategoryRead]:
    org = await _get_org_or_404(session, org_slug)
    
    cats = await session.execute(
        select(ProductCategory)
        .where(ProductCategory.org_id == org.id)
        .where(ProductCategory.is_active.is_(True))
        .order_by(ProductCategory.sort_order.asc(), ProductCategory.name.asc())
    )
    
    result = []
    for cat in cats.scalars().all():
        # Count products in category
        product_count = await session.execute(
            select(Product)
            .where(Product.category_id == cat.id)
            .where(Product.is_published.is_(True))
        )
        count = len(list(product_count.scalars().all()))
        
        result.append(CategoryRead(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            description=cat.description,
            image_url=cat.image_url,
            is_active=cat.is_active,
            product_count=count,
        ))
    
    return result


@router.get("/store/{org_slug}/categories/{category_slug}", response_model=CategoryRead)
async def get_category(org_slug: str, category_slug: str, session: DbSession) -> CategoryRead:
    org = await _get_org_or_404(session, org_slug)
    
    cat = await session.execute(
        select(ProductCategory)
        .where(ProductCategory.org_id == org.id)
        .where(ProductCategory.slug == category_slug)
    )
    category = cat.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return CategoryRead(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        image_url=category.image_url,
        is_active=category.is_active,
    )


# ============ Products ============

@router.get("/store/{org_slug}/products", response_model=list[StorefrontProductRead])
async def list_products(
    org_slug: str,
    session: DbSession,
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock: Optional[bool] = None,
    sort: Optional[str] = None,  # name_asc, name_desc, price_asc, price_desc, newest
    limit: int = Query(50, le=100),
    offset: int = 0,
) -> list[StorefrontProductRead]:
    org = await _get_org_or_404(session, org_slug)
    
    # Show all products (both published and unpublished) for now
    # This ensures inventory items appear in storefront immediately
    query = select(Product).where(Product.org_id == org.id)
    
    # Filter by category
    if category:
        cat = await session.execute(
            select(ProductCategory)
            .where(ProductCategory.org_id == org.id)
            .where(ProductCategory.slug == category)
        )
        cat_obj = cat.scalar_one_or_none()
        if cat_obj:
            query = query.where(Product.category_id == cat_obj.id)
    
    # Search
    if search:
        search_term = f"%{search}%"
        query = query.where(
            (Product.name.ilike(search_term)) | 
            (Product.description.ilike(search_term)) | 
            (Product.tags.ilike(search_term)) | 
            (Product.sku.ilike(search_term))
        )
    
    # Price range filter
    if min_price is not None:
        query = query.where(Product.sell_price >= min_price)
    if max_price is not None:
        query = query.where(Product.sell_price <= max_price)
    
    # Stock filter
    if in_stock is True:
        query = query.where(Product.inventory_quantity > 0)
    elif in_stock is False:
        query = query.where(Product.inventory_quantity <= 0)
    
    # Sorting
    if sort == "name_desc":
        query = query.order_by(Product.name.desc())
    elif sort == "price_asc":
        query = query.order_by(Product.sell_price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.sell_price.desc())
    elif sort == "newest":
        query = query.order_by(Product.created_at.desc())
    else:  # name_asc or default
        query = query.order_by(Product.name.asc())
    
    query = query.limit(limit).offset(offset)
    
    products = await session.execute(query)
    
    return [
        StorefrontProductRead(
            id=p.id,
            sku=p.sku,
            name=p.name,
            description=p.description,
            image_url=p.image_url,
            sell_price=float(p.sell_price),
            currency=p.currency,
            is_published=p.is_published,
            inventory_quantity=p.inventory_quantity if hasattr(p, 'inventory_quantity') else 0,
            reorder_level=p.reorder_level,
            is_in_stock=(p.inventory_quantity if hasattr(p, 'inventory_quantity') else 0) > 0 or p.is_published,
            category_id=p.category_id,
        )
        for p in products.scalars().all()
    ]


@router.get("/store/{org_slug}/products/{product_slug}", response_model=ProductDetailRead)
async def get_product(org_slug: str, product_slug: str, session: DbSession) -> ProductDetailRead:
    org = await _get_org_or_404(session, org_slug)
    
    # Products are identified by SKU in URL - show all (both published and unpublished)
    product = await session.execute(
        select(Product)
        .where(Product.org_id == org.id)
        .where(Product.sku == product_slug)
    )
    prod = product.scalar_one_or_none()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get category
    category = None
    if prod.category_id:
        cat = await session.get(ProductCategory, prod.category_id)
        if cat and cat.is_active:
            category = CategoryRead(
                id=cat.id,
                name=cat.name,
                slug=cat.slug,
                description=cat.description,
                image_url=cat.image_url,
                is_active=cat.is_active,
            )
    
    # Get variants
    variants = await session.execute(
        select(ProductVariant)
        .where(ProductVariant.product_id == prod.id)
        .where(ProductVariant.is_active.is_(True))
        .order_by(ProductVariant.sort_order.asc())
    )
    
    variant_list = []
    for v in variants.scalars().all():
        import json
        variant_list.append(ProductVariantRead(
            id=v.id,
            sku=v.sku,
            name=v.name,
            description=v.description,
            image_url=v.image_url,
            price=float(v.price),
            compare_at_price=float(v.compare_at_price),
            inventory_quantity=v.inventory_quantity,
            options=json.loads(v.options) if v.options else {},
        ))
    
    return ProductDetailRead(
        id=prod.id,
        sku=prod.sku,
        name=prod.name,
        description=prod.description,
        image_url=prod.image_url,
        sell_price=float(prod.sell_price),
        compare_at_price=float(prod.sell_price),  # Could add compare_at_price to Product
        currency=prod.currency,
        category=category,
        variants=variant_list,
        tags=prod.tags.split(",") if prod.tags else [],
        meta_title=prod.meta_title or prod.name,
        meta_description=prod.meta_description or prod.description[:160],
    )


# ============ Cart ============

@router.post("/store/{org_slug}/cart", response_model=CartRead)
async def create_cart(org_slug: str, session: DbSession) -> CartRead:
    org = await _get_org_or_404(session, org_slug)
    
    cart = Cart(
        id=str(uuid.uuid4()),
        org_id=org.id,
        session_id=str(uuid.uuid4()),
    )
    session.add(cart)
    await session.commit()
    
    return CartRead(
        id=cart.id,
        items=[],
        item_count=0,
        subtotal=0,
        currency="KES",
    )


@router.get("/store/{org_slug}/cart/{cart_id}", response_model=CartRead)
async def get_cart(org_slug: str, cart_id: str, session: DbSession) -> CartRead:
    org = await _get_org_or_404(session, org_slug)
    cart = await _get_cart_with_items(session, cart_id, org.id)
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = await session.execute(
        select(CartItem).where(CartItem.cart_id == cart_id)
    )
    
    item_list = []
    subtotal = 0
    
    for item in items.scalars().all():
        product = await session.get(Product, item.product_id)
        if not product:
            continue
        
        variant = None
        variant_name = None
        price = float(product.sell_price)
        
        if item.variant_id:
            variant = await session.get(ProductVariant, item.variant_id)
            if variant:
                variant_name = variant.name
                price = float(variant.price)
        
        line_total = price * item.quantity
        subtotal += line_total
        
        item_list.append(CartItemRead(
            id=item.id,
            product_id=item.product_id,
            product_name=product.name,
            variant_id=item.variant_id,
            variant_name=variant_name,
            image_url=variant.image_url if variant else product.image_url,
            price=price,
            quantity=item.quantity,
            line_total=line_total,
        ))
    
    return CartRead(
        id=cart.id,
        items=item_list,
        item_count=len(item_list),
        subtotal=subtotal,
        currency="KES",
    )


@router.post("/store/{org_slug}/cart/{cart_id}/items", response_model=CartRead)
async def add_to_cart(
    org_slug: str,
    cart_id: str,
    item: CartUpdateRequest,
    session: DbSession,
) -> CartRead:
    org = await _get_org_or_404(session, org_slug)
    cart = await _get_cart_with_items(session, cart_id, org.id)
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Validate product exists and is published
    product = await session.get(Product, item.product_id)
    if not product or not product.is_published or product.org_id != org.id:
        raise HTTPException(status_code=400, detail="Product not available")
    
    # Check inventory
    if item.variant_id:
        variant = await session.get(ProductVariant, item.variant_id)
        if variant and variant.track_inventory:
            if variant.inventory_quantity < item.quantity:
                raise HTTPException(status_code=400, detail="Insufficient inventory")
    else:
        # Check base product inventory (if tracked)
        pass
    
    # Check if item already in cart
    existing = await session.execute(
        select(CartItem)
        .where(CartItem.cart_id == cart_id)
        .where(CartItem.product_id == item.product_id)
        .where(CartItem.variant_id == item.variant_id)
    )
    existing_item = existing.scalar_one_or_none()
    
    if existing_item:
        existing_item.quantity += item.quantity
    else:
        new_item = CartItem(
            id=str(uuid.uuid4()),
            org_id=org.id,
            cart_id=cart_id,
            product_id=item.product_id,
            variant_id=item.variant_id,
            quantity=item.quantity,
        )
        session.add(new_item)
    
    await session.commit()
    
    # Return updated cart
    cart = await _get_cart_with_items(session, cart_id, org.id)
    return await get_cart(org_slug, cart_id, session)


@router.put("/store/{org_slug}/cart/{cart_id}/items/{item_id}", response_model=CartRead)
async def update_cart_item(
    org_slug: str,
    cart_id: str,
    item_id: str,
    item: CartUpdateRequest,
    session: DbSession,
) -> CartRead:
    org = await _get_org_or_404(session, org_slug)
    
    cart_item = await session.get(CartItem, item_id)
    if not cart_item or cart_item.cart_id != cart_id:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    if item.quantity <= 0:
        await session.delete(cart_item)
    else:
        # Check inventory
        if item.variant_id:
            variant = await session.get(ProductVariant, item.variant_id)
            if variant and variant.track_inventory and variant.inventory_quantity < item.quantity:
                raise HTTPException(status_code=400, detail="Insufficient inventory")
        
        cart_item.quantity = item.quantity
    
    await session.commit()
    return await get_cart(org_slug, cart_id, session)


@router.delete("/store/{org_slug}/cart/{cart_id}/items/{item_id}", response_model=CartRead)
async def remove_cart_item(org_slug: str, cart_id: str, item_id: str, session: DbSession) -> CartRead:
    org = await _get_org_or_404(session, org_slug)
    
    cart_item = await session.get(CartItem, item_id)
    if not cart_item or cart_item.cart_id != cart_id:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    await session.delete(cart_item)
    await session.commit()
    
    return await get_cart(org_slug, cart_id, session)


@router.delete("/store/{org_slug}/cart/{cart_id}", response_model=CartRead)
async def clear_cart(org_slug: str, cart_id: str, session: DbSession) -> CartRead:
    org = await _get_org_or_404(session, org_slug)
    
    await session.execute(
        delete(CartItem).where(CartItem.cart_id == cart_id)
    )
    await session.commit()
    
    return CartRead(
        id=cart_id,
        items=[],
        item_count=0,
        subtotal=0,
        currency="KES",
    )


# ============ Checkout ============

@router.post("/store/{org_slug}/checkout", response_model=OrderRead)
async def checkout(org_slug: str, payload: CheckoutRequest, session: DbSession) -> OrderRead:
    org = await _get_org_or_404(session, org_slug)
    
    # Get cart items
    cart = await _get_cart_with_items(session, payload.cart_id, org.id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = await session.execute(
        select(CartItem).where(CartItem.cart_id == payload.cart_id)
    )
    
    item_list = []
    for item in items.scalars().all():
        product = await session.get(Product, item.product_id)
        if not product:
            continue
        
        price = float(product.sell_price)
        if item.variant_id:
            variant = await session.get(ProductVariant, item.variant_id)
            if variant:
                price = float(variant.price)
        
        item_list.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
        })
    
    if not item_list:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Create order with shipping
    commerce_svc = CommerceService(session)
    order, order_items = await commerce_svc.create_order(
        org_id=org.id,
        data={
            "customer_name": payload.customer_name,
            "customer_email": payload.customer_email,
            "items": item_list,
            "currency": "KES",
        },
    )
    
    # Update order with shipping info
    order.shipping_name = payload.shipping_address.name
    order.shipping_phone = payload.shipping_address.phone
    order.shipping_address_line1 = payload.shipping_address.address_line1
    order.shipping_address_line2 = payload.shipping_address.address_line2 or ""
    order.shipping_city = payload.shipping_address.city
    order.shipping_state = payload.shipping_address.state
    order.shipping_postal_code = payload.shipping_address.postal_code
    order.shipping_country = payload.shipping_address.country
    
    await session.commit()
    await session.refresh(order)
    
    # Process payment (simulated for now)
    if payload.provider and payload.reference:
        try:
            await commerce_svc.pay_order(
                org_id=org.id,
                order_id=order.id,
                provider=payload.provider,
                reference=payload.reference,
            )
        except Exception as e:
            # Payment failed, order remains pending
            pass
    
    # Clear cart
    await session.execute(
        delete(CartItem).where(CartItem.cart_id == payload.cart_id)
    )
    await session.commit()
    
    return OrderRead(
        id=order.id,
        order_no=order.order_no,
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        status=order.status,
        payment_status=order.payment_status,
        total=float(order.total),
        currency=order.currency,
        created_at=order.created_at.isoformat() if order.created_at else datetime.utcnow().isoformat(),
    )


# ============ Order Status ============

@router.get("/store/{org_slug}/orders/{order_id}", response_model=OrderRead)
async def get_order(org_slug: str, order_id: str, session: DbSession, email: str = Query(...)) -> OrderRead:
    org = await _get_org_or_404(session, org_slug)
    
    order = await session.get(CommerceOrder, order_id)
    if not order or order.org_id != org.id:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify email matches
    if order.customer_email.lower() != email.lower():
        raise HTTPException(status_code=403, detail="Order does not match this email")
    
    # Get order items
    from app.models.commerce.order_item import CommerceOrderItem
    items = await session.execute(
        select(CommerceOrderItem).where(CommerceOrderItem.order_id == order_id)
    )
    
    item_data = []
    for item in items.scalars().all():
        item_data.append({
            "product_name": item.product_name,
            "quantity": item.quantity,
            "unit_price": float(item.unit_price),
            "line_total": float(item.line_total),
        })
    
    return OrderRead(
        id=order.id,
        order_no=order.order_no,
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        status=order.status,
        payment_status=order.payment_status,
        total=float(order.total),
        currency=order.currency,
        created_at=order.created_at.isoformat() if order.created_at else "",
        items=item_data,
    )


# ============ Customer Account (Storefront) ============

from pydantic import BaseModel, EmailStr
from app.models.crm.customer import Customer


class CustomerRegisterRequest(BaseModel):
    email: EmailStr
    name: str
    phone: str = ""


class CustomerLoginRequest(BaseModel):
    email: EmailStr


class CustomerRead(BaseModel):
    id: str
    name: str
    email: str
    phone: str


class CustomerAuthRead(BaseModel):
    customer: CustomerRead
    token: str


@router.post("/store/{org_slug}/register", response_model=CustomerAuthRead)
async def register_customer(org_slug: str, payload: CustomerRegisterRequest, session: DbSession) -> CustomerAuthRead:
    """Register a new customer for the storefront"""
    org = await _get_org_or_404(session, org_slug)
    
    # Check if customer already exists
    existing = await session.execute(
        select(Customer).where(
            Customer.org_id == org.id,
            Customer.email == payload.email.lower()
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    customer = Customer(
        org_id=org.id,
        name=payload.name,
        email=payload.email.lower(),
        phone=payload.phone,
    )
    session.add(customer)
    await session.commit()
    await session.refresh(customer)
    
    customer_read = CustomerRead(
        id=customer.id,
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
    )
    token = create_access_token(subject=customer.id, org_id=org.id, roles=["customer"])
    return CustomerAuthRead(customer=customer_read, token=token)


@router.post("/store/{org_slug}/login", response_model=CustomerAuthRead)
async def login_customer(org_slug: str, payload: CustomerLoginRequest, session: DbSession) -> CustomerAuthRead:
    """Login a customer by email (simple email-based auth)"""
    org = await _get_org_or_404(session, org_slug)
    
    customer = await session.execute(
        select(Customer).where(
            Customer.org_id == org.id,
            Customer.email == payload.email.lower()
        )
    )
    cust = customer.scalar_one_or_none()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer_read = CustomerRead(
        id=cust.id,
        name=cust.name,
        email=cust.email,
        phone=cust.phone,
    )
    token = create_access_token(subject=cust.id, org_id=org.id, roles=["customer"])
    return CustomerAuthRead(customer=customer_read, token=token)


@router.get("/store/{org_slug}/account", response_model=CustomerRead)
async def get_customer_account(
    org_slug: str,
    session: DbSession,
    auth: CurrentAuth,
    customer_id: str | None = None,
) -> CustomerRead:
    """Get customer account details"""
    org = await _get_org_or_404(session, org_slug)
    
    customer_id = customer_id or auth.user_id
    if auth.org_id != org.id or auth.user_id != customer_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    customer = await session.get(Customer, customer_id)
    if not customer or customer.org_id != org.id:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return CustomerRead(
        id=customer.id,
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
    )


class CustomerUpdateRequest(BaseModel):
    name: str | None = None
    phone: str | None = None


@router.patch("/store/{org_slug}/account", response_model=CustomerRead)
async def update_customer_account(
    org_slug: str,
    session: DbSession,
    auth: CurrentAuth,
    payload: CustomerUpdateRequest,
    customer_id: str | None = None,
) -> CustomerRead:
    """Update customer account details"""
    org = await _get_org_or_404(session, org_slug)
    
    customer_id = customer_id or auth.user_id
    if auth.org_id != org.id or auth.user_id != customer_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    customer = await session.get(Customer, customer_id)
    if not customer or customer.org_id != org.id:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if payload.name is not None:
        customer.name = payload.name
    if payload.phone is not None:
        customer.phone = payload.phone
    
    await session.commit()
    await session.refresh(customer)
    
    return CustomerRead(
        id=customer.id,
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
    )


@router.get("/store/{org_slug}/orders", response_model=list[OrderRead])
async def list_customer_orders(
    org_slug: str,
    session: DbSession,
    auth: CurrentAuth,
    customer_id: str | None = None,
) -> list[OrderRead]:
    """Get order history for a customer"""
    org = await _get_org_or_404(session, org_slug)
    
    customer_id = customer_id or auth.user_id
    if auth.org_id != org.id or auth.user_id != customer_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    customer = await session.get(Customer, customer_id)
    if not customer or customer.org_id != org.id:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    orders = await session.execute(
        select(CommerceOrder)
        .where(CommerceOrder.org_id == org.id)
        .where(CommerceOrder.customer_id == customer_id)
        .order_by(CommerceOrder.created_at.desc())
    )
    
    result = []
    from app.models.commerce.order_item import CommerceOrderItem
    for order in orders.scalars().all():
        items = await session.execute(
            select(CommerceOrderItem).where(CommerceOrderItem.order_id == order.id)
        )
        item_data = []
        for item in items.scalars().all():
            item_data.append({
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "line_total": float(item.line_total),
            })
        result.append(OrderRead(
            id=order.id,
            order_no=order.order_no,
            customer_name=order.customer_name,
            customer_email=order.customer_email,
            status=order.status,
            payment_status=order.payment_status,
            total=float(order.total),
            currency=order.currency,
            created_at=order.created_at.isoformat() if order.created_at else "",
            items=item_data,
        ))
    
    return result


# ============ Wishlist ============

@router.get("/store/{org_slug}/wishlist", response_model=WishlistRead)
async def get_wishlist(
    org_slug: str,
    session: DbSession,
    auth: CurrentAuth,
) -> WishlistRead:
    """Get customer's wishlist"""
    org = await _get_org_or_404(session, org_slug)
    
    if auth.org_id != org.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    wishlist_items = await session.execute(
        select(Wishlist, Product)
        .join(Product, Wishlist.product_id == Product.id)
        .where(Wishlist.org_id == org.id)
        .where(Wishlist.user_id == auth.user_id)
        .order_by(Wishlist.created_at.desc())
    )
    
    items = []
    for wish_item, product in wishlist_items.all():
        items.append(WishlistItemRead(
            id=wish_item.id,
            product_id=product.id,
            product_name=product.name,
            sku=product.sku,
            price=float(product.sell_price),
            currency=product.currency,
            image_url=product.image_url,
            added_at=wish_item.created_at.isoformat() if wish_item.created_at else "",
        ))
    
    return WishlistRead(items=items)


@router.post("/store/{org_slug}/wishlist")
async def add_to_wishlist(
    org_slug: str,
    session: DbSession,
    auth: CurrentAuth,
    product_id: str,
) -> dict:
    """Add a product to the customer's wishlist"""
    org = await _get_org_or_404(session, org_slug)
    
    if auth.org_id != org.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if product exists
    product = await session.get(Product, product_id)
    if not product or product.org_id != org.id:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if already in wishlist
    existing = await session.execute(
        select(Wishlist).where(
            Wishlist.org_id == org.id,
            Wishlist.user_id == auth.user_id,
            Wishlist.product_id == product_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Product already in wishlist")
    
    wish_item = Wishlist(
        id=str(uuid.uuid4()),
        org_id=org.id,
        user_id=auth.user_id,
        product_id=product_id,
    )
    session.add(wish_item)
    await session.commit()
    
    return {"message": "Added to wishlist"}


@router.delete("/store/{org_slug}/wishlist/{item_id}")
async def remove_from_wishlist(
    org_slug: str,
    item_id: str,
    session: DbSession,
    auth: CurrentAuth,
) -> dict:
    """Remove an item from the customer's wishlist"""
    org = await _get_org_or_404(session, org_slug)
    
    if auth.org_id != org.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    wish_item = await session.get(Wishlist, item_id)
    if not wish_item or wish_item.org_id != org.id or wish_item.user_id != auth.user_id:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    
    await session.delete(wish_item)
    await session.commit()
    
    return {"message": "Removed from wishlist"}


@router.delete("/store/{org_slug}/wishlist")
async def clear_wishlist(
    org_slug: str,
    session: DbSession,
    auth: CurrentAuth,
) -> dict:
    """Clear the customer's entire wishlist"""
    org = await _get_org_or_404(session, org_slug)
    
    if auth.org_id != org.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    await session.execute(
        delete(Wishlist).where(
            Wishlist.org_id == org.id,
            Wishlist.user_id == auth.user_id,
        )
    )
    await session.commit()
    
    return {"message": "Wishlist cleared"}

