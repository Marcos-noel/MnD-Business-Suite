"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AccountShell } from "@/app/store/[org]/account/_components/AccountShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { getStoredAuth } from "@/lib/auth";
import { ShoppingCart, Heart, Package, ArrowRight } from "lucide-react";

type WishlistItem = {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  price: number;
  currency: string;
  image_url?: string;
  added_at: string;
};

export default function WishlistPage() {
  const params = useParams();
  const router = useRouter();
  const org = params.org as string;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth) {
      router.replace(`/store/${org}/login?redirect=/store/${org}/account/wishlist`);
      return;
    }
    setIsAuthenticated(true);
    setAuthLoading(false);
  }, [org, router]);

  // Load wishlist
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const loadWishlist = async () => {
      try {
        setLoading(true);
        const auth = getStoredAuth();
        if (!auth?.token) throw new Error("Not authenticated");

        const res = await fetch(`/api/store/${org}/wishlist`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load wishlist");
        const data = await res.json();
        setWishlistItems(data.items || []);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [org, isAuthenticated, authLoading]);

  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      setRemovingItem(itemId);
      const auth = getStoredAuth();
      if (!auth?.token) throw new Error("Not authenticated");

      const res = await fetch(`/api/store/${org}/wishlist/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to remove from wishlist");
      setWishlistItems(wishlistItems.filter((item) => item.id !== itemId));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRemovingItem(null);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      setAddingToCart(item.id);
      const auth = getStoredAuth();
      if (!auth?.token) throw new Error("Not authenticated");

      // Get or create cart
      let cartId = localStorage.getItem("mnd_cart_id");
      if (!cartId || cartId === "undefined") {
        const cartRes = await fetch(`/api/store/${org}/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        });
        if (!cartRes.ok) throw new Error("Failed to create cart");
        const cart = await cartRes.json();
        cartId = cart.id;
        localStorage.setItem("mnd_cart_id", cartId);
      }

      // Add item to cart
      const addRes = await fetch(`/api/store/${org}/cart/${cartId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          product_id: item.product_id,
          quantity: 1,
        }),
      });

      if (!addRes.ok) throw new Error("Failed to add to cart");
      
      // Show success and redirect
      setTimeout(() => {
        router.push(`/store/${org}/cart`);
      }, 500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAddingToCart(null);
    }
  };

  if (authLoading || loading) {
    return (
      <AccountShell
        org={org}
        title="Wishlist"
        subtitle="Save your favorite items"
        active="wishlist"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-40 w-full rounded-lg mb-3" />
              <Skeleton className="h-5 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell
      org={org}
      title="Wishlist"
      subtitle="Save your favorite items"
      active="wishlist"
    >
      {error && (
        <Card className="border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500 mb-6">
          {error}
        </Card>
      )}

      {wishlistItems.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-[hsl(var(--c-muted-2))]" />
          <div className="mt-4 text-lg font-medium">Your wishlist is empty</div>
          <div className="mt-2 text-[hsl(var(--c-muted-2))]">
            Add items to your wishlist to save them for later
          </div>
          <Link href={`/store/${org}`}>
            <Button className="mt-6">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="overflow-hidden p-4 flex flex-col">
              {/* Product Image */}
              <div className="h-32 bg-[hsl(var(--c-muted))] rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-8 w-8 text-[hsl(var(--c-muted-2))]" />
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <Link href={`/store/${org}/product/${item.sku}`}>
                  <h3 className="font-medium line-clamp-2 hover:text-[hsl(var(--c-accent))]">
                    {item.product_name}
                  </h3>
                </Link>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-semibold">
                    {item.currency} {item.price.toFixed(2)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[hsl(var(--c-muted-2))]">
                  Added {new Date(item.added_at).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  disabled={removingItem === item.id}
                  className="flex items-center justify-center gap-1"
                >
                  <Heart className="h-3 w-3 fill-current" />
                  {removingItem === item.id ? "..." : "Remove"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(item)}
                  disabled={addingToCart === item.id}
                  className="flex items-center justify-center gap-1"
                >
                  <ShoppingCart className="h-3 w-3" />
                  {addingToCart === item.id ? "..." : "Cart"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
