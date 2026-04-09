"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ProductDetail,
  ProductVariant,
  createCart,
  getCart,
  addToCart,
  setCartId,
  Cart
} from "@/lib/store";
import { IconArrowLeft, IconBox, IconCheck } from "@/components/icons/AppIcons";
import { ShoppingCart, Minus, Plus, Heart, Check } from "lucide-react";
import { useLocale } from "@/lib/locale";

export default function ProductPageClient() {
  const params = useParams<{ org: string; sku: string }>();
  const org = params.org;
  const sku = params.sku;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { formatCurrency } = useLocale();

  // Load product
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/store/${org}/products/${sku}`, { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error?.message ?? "Product not found");
        }

        setProduct(data);

        // Auto-select first variant if available
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [org, sku]);

  async function handleAddToCart() {
    if (!product) return;

    try {
      setAddingToCart(true);

      // Get or create cart
      let cartId = localStorage.getItem("mnd_cart_id");
      let cart: Cart;

      if (!cartId) {
        cart = await createCart(org);
        setCartId(cart.id);
        cartId = cart.id;
      } else {
        cart = await getCart(org, cartId);
      }

      // Add item to cart
      const variantId = selectedVariant?.id || product.variants?.[0]?.id;
      if (!variantId) return;

      await addToCart(org, cartId, variantId, quantity);

      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    } catch (e) {
      console.error("Failed to add to cart:", e);
    } finally {
      setAddingToCart(false);
    }
  }

  const currentPrice = selectedVariant?.price || product?.price || 0;
  const originalPrice = selectedVariant?.original_price || product?.original_price;
  const discount = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[hsl(var(--c-text))]">Product Not Found</h1>
          <p className="mt-2 text-[hsl(var(--c-muted-2))]">{error}</p>
          <Link href={`/store/${org}`} className="mt-4 inline-block text-[hsl(var(--c-accent))]">
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href={`/store/${org}`}
          className="inline-flex items-center gap-2 text-sm text-[hsl(var(--c-muted-2))] hover:text-[hsl(var(--c-text))] transition-colors"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-2xl bg-[hsl(var(--c-surface))]">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <IconBox className="h-24 w-24 text-[hsl(var(--c-muted-2))]" />
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--c-text))]">{product.name}</h1>
            {product.description && (
              <p className="mt-2 text-[hsl(var(--c-muted-2))]">{product.description}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[hsl(var(--c-text))]">
              {formatCurrency(currentPrice)}
            </span>
            {originalPrice && originalPrice > currentPrice && (
              <>
                <span className="text-lg text-[hsl(var(--c-muted-2))] line-through">
                  {formatCurrency(originalPrice)}
                </span>
                <span className="rounded-full bg-[hsl(var(--c-success))]/10 px-2 py-1 text-sm font-medium text-[hsl(var(--c-success))]">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 1 && (
            <div>
              <h3 className="mb-3 font-medium text-[hsl(var(--c-text))]">Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      selectedVariant?.id === variant.id
                        ? "border-[hsl(var(--c-accent))] bg-[hsl(var(--c-accent))]/10 text-[hsl(var(--c-accent))]"
                        : "border-[hsl(var(--c-border))] text-[hsl(var(--c-text))] hover:border-[hsl(var(--c-accent))]"
                    }`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="mb-3 font-medium text-[hsl(var(--c-text))]">Quantity</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1"
            >
              {addingToCart ? (
                "Adding..."
              ) : addedFeedback ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart
                className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
