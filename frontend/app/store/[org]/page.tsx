"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";

type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  image_url: string;
  sell_price: number;
  currency: string;
};

export default function StorefrontPage() {
  const params = useParams<{ org: string }>();
  const org = params.org;
  const [products, setProducts] = useState<Product[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [email, setEmail] = useState("buyer@example.com");
  const [name, setName] = useState("Guest Buyer");
  const [productId, setProductId] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [placing, setPlacing] = useState(false);
  const currency = useMemo(() => products?.find((p) => p.id === productId)?.currency ?? "", [products, productId]);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const res = await fetch(`/api/store/${org}/products`, { cache: "no-store" });
        const data = (await res.json()) as any;
        if (!res.ok) throw new Error(data?.error?.message ?? "Failed to load storefront");
        setProducts(data as Product[]);
      } catch (e) {
        setErr((e as Error).message);
      }
    })();
  }, [org]);

  async function checkout() {
    if (!productId) return;
    try {
      setErr(null);
      setPlacing(true);
      const res = await fetch(`/api/store/${org}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          customer_email: email,
          items: [{ product_id: productId, quantity: qty }],
          provider: "mpesa",
          reference: ""
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? "Checkout failed");
      alert(`Order placed. Currency: ${currency}`);
      setProductId("");
      setQty(1);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4">
        <div className="text-lg font-semibold">Storefront</div>
        <div className="text-sm text-white/50">Public product catalog for {org}</div>
      </div>

      {err && <Card className="border-red-500/30 bg-red-500/10 text-sm">{err}</Card>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 text-sm font-semibold">Products</div>
          {!products ? (
            <Skeleton className="h-10" />
          ) : products.length === 0 ? (
            <div className="text-sm text-white/60">No published products yet.</div>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProductId(p.id)}
                  className={`glass w-full rounded-2xl p-4 text-left transition hover:bg-white/5 ${
                    productId === p.id ? "border-white/20" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-white/50">{p.sku}</div>
                      {p.description && <div className="mt-2 text-xs text-white/60">{p.description}</div>}
                    </div>
                    <div className="text-sm font-semibold">
                      {p.currency} {Number(p.sell_price).toFixed(2)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 text-sm font-semibold">Checkout</div>
          <div className="space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            <Button onClick={checkout} disabled={!productId || placing}>
              {placing ? "Placing..." : "Pay with M-Pesa (sim)"}
            </Button>
            <div className="text-xs text-white/50">
              This uses the backend simulation layer; swap to real providers later.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
