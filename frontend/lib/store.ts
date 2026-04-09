// Storefront Types

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  product_count: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  compare_at_price: number;
  inventory_quantity: number;
  options: Record<string, string>;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  image_url: string;
  sell_price: number;
  currency: string;
  is_published: boolean;
  inventory_quantity: number;
  reorder_level: number;
  is_in_stock: boolean;
  category_id: string | null;
}

export interface ProductDetail extends Product {
  compare_at_price: number;
  category: Category | null;
  variants: ProductVariant[];
  tags: string[];
  meta_title: string;
  meta_description: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_id: string | null;
  variant_name: string | null;
  image_url: string;
  price: number;
  quantity: number;
  line_total: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  item_count: number;
  subtotal: number;
  currency: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  order_no: string;
  customer_name: string;
  customer_email: string;
  status: string;
  payment_status: string;
  total: number;
  currency: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

// Cart Store (Client-side state)
let cartId: string | null = null;
let cartListener: ((cart: Cart | null) => void) | null = null;

export function subscribeToCart(listener: (cart: Cart | null) => void) {
  cartListener = listener;
  return () => {
    cartListener = null;
  };
}

function notifyCartChange(cart: Cart | null) {
  if (cartListener) {
    cartListener(cart);
  }
}

export async function createCart(orgSlug: string): Promise<Cart> {
  const res = await fetch(`/api/store/${orgSlug}/cart`, {
    method: "POST",
  });
  const data = await res.json();
  if (!data.id || data.id === "undefined") {
    throw new Error("Invalid cart ID from server");
  }
  cartId = data.id;
  return data;
}

export async function getCart(orgSlug: string, id: string): Promise<Cart> {
  if (!id || id === "undefined") {
    throw new Error("Invalid cart ID");
  }
  const res = await fetch(`/api/store/${orgSlug}/cart/${id}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Cart not found");
    }
    throw new Error(`Failed to fetch cart: ${res.status}`);
  }
  const data = await res.json();
  notifyCartChange(data);
  return data;
}

export async function addToCart(
  orgSlug: string,
  cartId: string,
  productId: string,
  variantId?: string,
  quantity: number = 1
): Promise<Cart> {
  const res = await fetch(`/api/store/${orgSlug}/cart/${cartId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, variant_id: variantId, quantity }),
  });
  const data = await res.json();
  notifyCartChange(data);
  return data;
}

export async function updateCartItem(
  orgSlug: string,
  cartId: string,
  itemId: string,
  quantity: number
): Promise<Cart> {
  const res = await fetch(`/api/store/${orgSlug}/cart/${cartId}/items/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: "", quantity }),
  });
  const data = await res.json();
  notifyCartChange(data);
  return data;
}

export async function removeFromCart(
  orgSlug: string,
  cartId: string,
  itemId: string
): Promise<Cart> {
  const res = await fetch(`/api/store/${orgSlug}/cart/${cartId}/items/${itemId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  notifyCartChange(data);
  return data;
}

export function getCartId(): string | null {
  return cartId;
}

export function setCartId(id: string) {
  if (!id || id === "undefined" || id === "null") {
    return;
  }
  cartId = id;
  if (typeof window !== "undefined") {
    localStorage.setItem("mnd_cart_id", id);
  }
}

export function initCartFromStorage() {
  if (typeof window !== "undefined") {
    const storedId = localStorage.getItem("mnd_cart_id");
    if (storedId && storedId !== "undefined" && storedId !== "null") {
      cartId = storedId;
    }
  }
}
