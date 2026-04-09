"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  Cart as CartType,
  CartItem,
  getCart, 
  updateCartItem, 
  removeFromCart,
  setCartId
} from "@/lib/store";
import { ShoppingCart, ArrowLeft, Trash2, Minus, Plus, CreditCard, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CartPage() {
  const params = useParams<{ org: string }>();
  const org = params.org;
  const router = useRouter();
  
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Load cart
  useEffect(() => {
    (async () => {
      const cartId = localStorage.getItem("mnd_cart_id");
      if (!cartId || cartId === "undefined") {
        setLoading(false);
        return;
      }
      
      try {
        const cartData = await getCart(org, cartId);
        setCart(cartData);
      } catch (e) {
        // Cart might be invalid
        localStorage.removeItem("mnd_cart_id");
      } finally {
        setLoading(false);
      }
    })();
  }, [org]);

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    if (!cart) return;
    
    try {
      setUpdating(itemId);
      const updatedCart = await updateCartItem(org, cart.id, itemId, quantity);
      setCart(updatedCart);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdating(null);
    }
  }

  async function handleRemoveItem(itemId: string) {
    if (!cart) return;
    
    try {
      setUpdating(itemId);
      const updatedCart = await removeFromCart(org, cart.id, itemId);
      setCart(updatedCart);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--c-surface))] p-6">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-24 w-24" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[hsl(var(--c-surface))] p-6">
        <div className="mx-auto max-w-4xl">
          <Link 
            href={`/store/${org}`}
            className="inline-flex items-center gap-1 text-sm text-[hsl(var(--c-muted-2))] hover:text-[hsl(var(--c-text))] mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
          </Link>
          
          <Card className="p-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-[hsl(var(--c-muted-2))]" />
            <div className="mt-4 text-lg font-medium">Your cart is empty</div>
            <div className="mt-2 text-[hsl(var(--c-muted-2))]">
              Add some products to get started
            </div>
            <Link href={`/store/${org}`}>
              <Button className="mt-6">Browse Products</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--c-surface))]">
      <div className="mx-auto max-w-4xl p-6">
        <Link 
          href={`/store/${org}`}
          className="inline-flex items-center gap-1 text-sm text-[hsl(var(--c-muted-2))] hover:text-[hsl(var(--c-text))] mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>
        
        <h1 className="text-2xl font-bold mb-6">Shopping Cart ({cart.item_count} items)</h1>

        {error && (
          <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-24 bg-[hsl(var(--c-muted))] rounded-lg overflow-hidden shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-8 w-8 text-[hsl(var(--c-muted-2))]" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        {item.variant_name && (
                          <div className="text-sm text-[hsl(var(--c-muted-2))]">{item.variant_name}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{cart.currency} {item.line_total.toFixed(2)}</div>
                        <div className="text-sm text-[hsl(var(--c-muted-2))]">
                          {cart.currency} {item.price.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-[hsl(var(--c-border))] rounded">
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={updating === item.id}
                          className="p-2 hover:bg-[hsl(var(--c-muted))] rounded-l-lg disabled:opacity-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updating === item.id}
                          className="p-2 hover:bg-[hsl(var(--c-muted))] rounded-r-lg disabled:opacity-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updating === item.id}
                        className="p-2 text-[hsl(var(--c-muted-2))] hover:text-red-500 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="text-lg font-semibold mb-4">Order Summary</div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--c-muted-2))]">Subtotal</span>
                  <span>{cart.currency} {cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--c-muted-2))]">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--c-muted-2))]">Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              
              <div className="border-t border-[hsl(var(--c-border))] my-4"></div>
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{cart.currency} {cart.subtotal.toFixed(2)}</span>
              </div>
              
              <Link href={`/store/${org}/checkout?cart=${cart.id}`}>
                <Button className="w-full mt-6" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
