"""
Shop-specific permissions for RBAC.

These permissions control access to storefront and e-commerce features.
"""

# Shop permissions
SHOP_VIEW = "shop.view"
SHOP_ORDERS_VIEW = "shop.orders.view"
SHOP_ORDERS_MANAGE = "shop.orders.manage"
SHOP_PRODUCTS_VIEW = "shop.products.view"
SHOP_PRODUCTS_MANAGE = "shop.products.manage"
SHOP_CUSTOMERS_VIEW = "shop.customers.view"
SHOP_CUSTOMERS_MANAGE = "shop.customers.manage"
SHOP_ANALYTICS_VIEW = "shop.analytics.view"
SHOP_SETTINGS_MANAGE = "shop.settings.manage"

# Role definitions for shop
SHOP_STAFF_PERMISSIONS = [
    SHOP_VIEW,
    SHOP_ORDERS_VIEW,
    SHOP_PRODUCTS_VIEW,
    SHOP_CUSTOMERS_VIEW,
    SHOP_ANALYTICS_VIEW,
]

SHOP_MANAGER_PERMISSIONS = SHOP_STAFF_PERMISSIONS + [
    SHOP_ORDERS_MANAGE,
    SHOP_PRODUCTS_MANAGE,
    SHOP_CUSTOMERS_MANAGE,
    SHOP_SETTINGS_MANAGE,
]

# Map old commerce/inventory permissions to shop permissions
# For backward compatibility
PERMISSION_MAPPING = {
    # Commerce -> Shop
    "commerce.orders.view": SHOP_ORDERS_VIEW,
    "commerce.orders.manage": SHOP_ORDERS_MANAGE,
    "commerce.customers.view": SHOP_CUSTOMERS_VIEW,
    "commerce.customers.manage": SHOP_CUSTOMERS_MANAGE,
    # Inventory -> Shop
    "inventory.products.view": SHOP_PRODUCTS_VIEW,
    "inventory.products.manage": SHOP_PRODUCTS_MANAGE,
}


def get_shop_permissions(user_permissions: list[str]) -> list[str]:
    """
    Map user's existing permissions to shop permissions.
    
    This provides backward compatibility for users with commerce/inventory
    permissions to access shop features.
    """
    shop_perms = set()
    for perm in user_permissions:
        if perm in PERMISSION_MAPPING:
            shop_perms.add(PERMISSION_MAPPING[perm])
        elif perm.startswith(("commerce.", "inventory.")):
            # Generic commerce/inventory permission - map to shop
            action = perm.split(".")[-1]
            if "orders" in perm:
                shop_perms.add(SHOP_ORDERS_VIEW if action == "view" else SHOP_ORDERS_MANAGE)
            elif "products" in perm:
                shop_perms.add(SHOP_PRODUCTS_VIEW if action == "view" else SHOP_PRODUCTS_MANAGE)
            elif "customers" in perm:
                shop_perms.add(SHOP_CUSTOMERS_VIEW if action == "view" else SHOP_CUSTOMERS_MANAGE)
        else:
            shop_perms.add(perm)
    return list(shop_perms)


def can_manage_shop(user_permissions: list[str]) -> bool:
    """Check if user can manage shop settings."""
    shop_perms = get_shop_permissions(user_permissions)
    return SHOP_SETTINGS_MANAGE in shop_perms


def can_manage_orders(user_permissions: list[str]) -> bool:
    """Check if user can manage orders."""
    shop_perms = get_shop_permissions(user_permissions)
    return SHOP_ORDERS_MANAGE in shop_perms


def can_manage_products(user_permissions: list[str]) -> bool:
    """Check if user can manage products."""
    shop_perms = get_shop_permissions(user_permissions)
    return SHOP_PRODUCTS_MANAGE in shop_perms


def can_view_analytics(user_permissions: list[str]) -> bool:
    """Check if user can view shop analytics."""
    shop_perms = get_shop_permissions(user_permissions)
    return SHOP_ANALYTICS_VIEW in shop_perms
