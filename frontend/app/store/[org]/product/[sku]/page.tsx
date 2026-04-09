import type { Metadata } from "next";
import ProductPageClient from "./ProductPageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { org: string; sku: string } }) {
  try {
    const res = await fetch(`/api/store/${params.org}/products/${params.sku}`, { cache: "no-store" });
    if (!res.ok) return {};
    const product = await res.json();
    return {
      title: product.meta_title || product.name,
      description: product.meta_description || product.description,
      openGraph: {
        title: product.meta_title || product.name,
        description: product.meta_description || product.description,
        images: product.image_url ? [product.image_url] : [],
      },
    };
  } catch {
    return {};
  }
}

export default function ProductPage() {
  return <ProductPageClient />;
}
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

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
      
      // Add to cart
      await addToCart(
        org, 
        cart.id, 
        product.id, 
        selectedVariant?.id,
        quantity
      );
      
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAddingToCart(false);
    }
  }

  // Calculate price
  const currentPrice = selectedVariant ? selectedVariant.price : (product?.sell_price ?? 0);
  const compareAtPrice = selectedVariant ? selectedVariant.compare_at_price : (product?.compare_at_price ?? 0);
  const isOnSale = compareAtPrice > currentPrice && compareAtPrice > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--c-surface))] p-6">
        <div className="mx-auto max-w-5xl">
          <Skeleton className="h-6 w-20 mb-6" />
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[hsl(var(--c-surface))] p-6">
        <div className="mx-auto max-w-5xl">
          <Card className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-[hsl(var(--c-muted-2))]" />
            <div className="mt-4 text-lg font-medium">Product not found</div>
            <div className="mt-2 text-[hsl(var(--c-muted-2))]">
              {error || "This product may have been removed"}
            </div>
            <Link href={`/store/${org}`}>
              <Button className="mt-6">Back to Store</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--c-surface))]">
      <div className="mx-auto max-w-5xl p-6">
        {/* Back link */}
        <Link 
          href={`/store/${org}`}
          className="inline-flex items-center gap-1 text-sm text-[hsl(var(--c-muted-2))] hover:text-[hsl(var(--c-text))] mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square bg-[hsl(var(--c-muted))] rounded-2xl overflow-hidden">
            {selectedVariant?.image_url || product.image_url ? (
              <img 
                src={selectedVariant?.image_url || product.image_url} 
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-24 w-24 text-[hsl(var(--c-muted-2))]" />
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {/* Category */}
            {product.category && (
              <div className="text-sm text-[hsl(var(--c-muted-2))] mb-2">
                {product.category.name}
              </div>
            )}
            
            <h1 className="text-2xl font-bold">{product.name}</h1>
            
            {/* Price */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-bold">
                {product.currency} {currentPrice.toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-lg text-[hsl(var(--c-muted-2))] line-through">
                  {product.currency} {compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-medium mb-2">Options</div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        selectedVariant?.id === variant.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-[hsl(var(--c-border))] hover:border-[hsl(var(--c-muted-2))]"
                      }`}
                    >
                      {variant.name}
                      {variant.inventory_quantity <= 0 && (
                        <span className="ml-1 text-xs text-red-500">(Out of stock)</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-6 text-[hsl(var(--c-muted-2))]">
              {product.description}
            </div>

            {/* Quantity & Add to Cart */}  
            <div className="mt-8 flex gap-4">
              <div className="flex items-center border border-[hsl(var(--c-border))] rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-[hsl(var(--c-muted))] rounded-l-lg"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-[hsl(var(--c-muted))] rounded-r-lg"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <Button 
                className="flex-1"
                onClick={handleAddToCart}
                disabled={addingToCart || (selectedVariant && selectedVariant.inventory_quantity <= 0)}
              >
                {addedFeedback ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Added to Cart
                  </span>
                ) : addingToCart ? (
                  "Adding..."
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </span>
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={isWishlisted ? "text-red-500 border-red-500" : ""}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
              </Button>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[hsl(var(--c-border))]">
                <div className="text-sm text-[hsl(var(--c-muted-2))] mb-2">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 bg-[hsl(var(--c-muted))] rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
