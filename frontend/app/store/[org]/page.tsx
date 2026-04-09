"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  Category, 
  Product, 
  createCart, 
  getCart, 
  addToCart, 
  setCartId, 
  initCartFromStorage,
  Cart 
} from "@/lib/store";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { IconBox, IconCheck } from "@/components/icons/AppIcons";

export const dynamic = "force-dynamic";

export default function StorefrontPage() {
  const params = useParams<{ org: string }>();
  const searchParams = useSearchParams();
  const org = params.org;
  const categorySlug = searchParams.get("category");
  
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize cart
  useEffect(() => {
    initCartFromStorage();
  }, []);

  // Load categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/store/${org}/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (e) {
        // Categories optional, ignore
      }
    })();
  }, [org]);

  // Load products
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        
        let url = `/api/store/${org}/products?limit=50`;
        if (categorySlug) {
          url += `&category=${categorySlug}`;
        }
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
        
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data?.error?.message ?? "Failed to load products");
        }
        
        setProducts(data);
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [org, categorySlug, search]);

  // Load cart
  useEffect(() => {
    (async () => {
      const storedCartId = localStorage.getItem("mnd_cart_id");
      if (storedCartId) {
        try {
          const cartData = await getCart(org, storedCartId);
          setCart(cartData);
        } catch (e) {
          // Cart might be invalid, create new one
        }
      }
      
      // Create cart if none exists
      if (!storedCartId) {
        try {
          const newCart = await createCart(org);
          setCartId(newCart.id);
          setCart(newCart);
        } catch (e) {
          // Ignore
        }
      }
    })();
  }, [org]);

  async function handleAddToCart(productId: string) {
    if (!cart) return;
    
    try {
      setAddingToCart(productId);
      const updatedCart = await addToCart(org, cart.id, productId);
      setCart(updatedCart);
      
      // Show feedback
      setAddedFeedback(productId);
      setTimeout(() => setAddedFeedback(null), 2000);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setAddingToCart(null);
    }
  }

  const currentCategory = useMemo(() => {
    return categories.find(c => c.slug === categorySlug);
  }, [categories, categorySlug]);

  return (
    <div className="min-h-screen bg-[hsl(var(--c-surface))]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface))]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          
          <Link href={`/store/${org}`} className="text-xl font-bold">
            Store
          </Link>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--c-muted-2))]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-10"
              />
            </div>
          </div>
          
          <Link href={`/store/${org}/cart`} className="relative">
            <Button variant="ghost" size="sm">
              <ShoppingCart className="h-4 w-4" />
              {cart && cart.item_count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cart.item_count}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-4">
        {/* Breadcrumb */}
        {currentCategory && (
          <div className="mb-4 flex items-center gap-2 text-sm text-[hsl(var(--c-muted-2))]">
            <Link href={`/store/${org}`} className="hover:text-[hsl(var(--c-text))]">Home</Link>
            <span>/</span>
            <span>{currentCategory.name}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-64 bg-[hsl(var(--c-surface))] p-4">
                <Card className="p-4">
                  <div className="text-sm font-semibold mb-3">Categories</div>
                  <nav className="space-y-1">
                    <Link
                      href={`/store/${org}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block rounded px-2 py-1 text-sm hover:bg-[hsl(var(--c-muted))] ${
                        !categorySlug ? "bg-[hsl(var(--c-muted))] font-medium" : ""
                      }`}
                    >
                      All Products
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/store/${org}?category=${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block rounded px-2 py-1 text-sm hover:bg-[hsl(var(--c-muted))] ${
                          categorySlug === cat.slug ? "bg-[hsl(var(--c-muted))] font-medium" : ""
                        }`}
                      >
                        {cat.name}
                        {cat.product_count > 0 && (
                          <span className="ml-1 text-[hsl(var(--c-muted-2))]">({cat.product_count})</span>
                        )}
                      </Link>
                    ))}
                  </nav>
                </Card>
              </div>
            </div>
          )}

          {/* Sidebar - Categories (Desktop) */}
          <aside className="hidden lg:block w-48 shrink-0">
            <Card className="p-4">
              <div className="text-sm font-semibold mb-3">Categories</div>
              <nav className="space-y-1">
                <Link
                  href={`/store/${org}`}
                  className={`block rounded px-2 py-1 text-sm hover:bg-[hsl(var(--c-muted))] ${
                    !categorySlug ? "bg-[hsl(var(--c-muted))] font-medium" : ""
                  }`}
                >
                  All Products
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/store/${org}?category=${cat.slug}`}
                    className={`block rounded px-2 py-1 text-sm hover:bg-[hsl(var(--c-muted))] ${
                      categorySlug === cat.slug ? "bg-[hsl(var(--c-muted))] font-medium" : ""
                    }`}
                  >
                    {cat.name}
                    {cat.product_count > 0 && (
                      <span className="ml-1 text-[hsl(var(--c-muted-2))]">({cat.product_count})</span>
                    )}
                  </Link>
                ))}
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {err && (
              <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
                {err}
              </Card>
            )}

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </Card>
                ))}
              </div>
            ) : products && products.length === 0 ? (
              <Card className="p-12 text-center">
                <IconBox className="mx-auto h-12 w-12 text-[hsl(var(--c-muted-2))]" />
                <div className="mt-4 text-lg font-medium">No products found</div>
                <div className="mt-2 text-[hsl(var(--c-muted-2))]">
                  {search ? "Try a different search term" : "This store has no products yet"}
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products?.map((product) => (
                  <Card key={product.id} className="overflow-hidden transition hover:shadow-lg">
                    <div className="aspect-square bg-[hsl(var(--c-muted))] relative">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <IconBox className="h-12 w-12 text-[hsl(var(--c-muted-2))]" />
                        </div>
                      )}
                      {/* Stock status badges */}
                      {!product.is_in_stock && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Out of Stock
                        </div>
                      )}
                      {product.is_in_stock && product.inventory_quantity <= product.reorder_level && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                          Low Stock
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <Link href={`/store/${org}/product/${product.sku}`}>
                        <h3 className="font-medium hover:text-primary">{product.name}</h3>
                      </Link>
                      <div className="mt-1 text-sm text-[hsl(var(--c-muted-2))]">
                        {product.description && product.description.substring(0, 60)}
                        {product.description && product.description.length > 60 && "..."}
                      </div>
                      <div className="mt-2 text-xs text-[hsl(var(--c-muted-2))]">
                        {product.is_in_stock 
                          ? `${product.inventory_quantity} in stock`
                          : "Currently unavailable"
                        }
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-lg font-bold">
                          {product.currency} {Number(product.sell_price).toFixed(2)}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product.id)}
                          disabled={addingToCart === product.id || !product.is_in_stock}
                          variant={!product.is_in_stock ? "secondary" : "primary"}
                        >
                          {addedFeedback === product.id ? (
                            <span className="flex items-center gap-1">
                              <IconCheck className="h-3 w-3" /> Added
                            </span>
                          ) : addingToCart === product.id ? (
                            "Adding..."
                          ) : !product.is_in_stock ? (
                            "Out of Stock"
                          ) : (
                            <span className="flex items-center gap-1">
                              <ShoppingCart className="h-3 w-3" /> Add
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-[hsl(var(--c-border))] pt-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="font-semibold mb-3">Store</h3>
              <nav className="space-y-2 text-sm text-[hsl(var(--c-muted-2))]">
                <Link href={`/store/${org}`} className="block hover:text-[hsl(var(--c-text))]">
                  All Products
                </Link>
                <Link href={`/store/${org}/cart`} className="block hover:text-[hsl(var(--c-text))]">
                  Shopping Cart
                </Link>
                <Link href={`/store/${org}/account`} className="block hover:text-[hsl(var(--c-text))]">
                  My Account
                </Link>
              </nav>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <nav className="space-y-2 text-sm text-[hsl(var(--c-muted-2))]">
                <Link href={`/store/${org}/account/orders`} className="block hover:text-[hsl(var(--c-text))]">
                  Order History
                </Link>
                <div className="block">Contact Us</div>
                <div className="block">Shipping Info</div>
              </nav>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <nav className="space-y-2 text-sm text-[hsl(var(--c-muted-2))]">
                <div className="block">Privacy Policy</div>
                <div className="block">Terms of Service</div>
                <div className="block">Returns</div>
              </nav>
            </div>
            <div>
              <h3 className="font-semibold mb-3">About</h3>
              <p className="text-sm text-[hsl(var(--c-muted-2))]">
                Powered by MnD Business Suite
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-[hsl(var(--c-border))] pt-4 text-center text-sm text-[hsl(var(--c-muted-2))]">
            © 2026 MnD Business Suite. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
