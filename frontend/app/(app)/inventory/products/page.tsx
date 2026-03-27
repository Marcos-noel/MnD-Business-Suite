"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

type Product = {
  id: string;
  sku: string;
  name: string;
  sell_price: number;
  currency: string;
  is_published: boolean;
  unit: string;
  reorder_level: number;
  unit_cost: number;
};

type Level = {
  product_id: string;
  sku: string;
  name: string;
  on_hand: number;
  reorder_level: number;
  needs_reorder: boolean;
};

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<{ product: Product; svg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;
  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    image_url: "",
    unit: "pcs",
    reorder_level: 10,
    unit_cost: 0,
    sell_price: 0,
    currency: "USD",
    is_published: false
  });

  async function load({ reset }: { reset: boolean }) {
    try {
      setError(null);
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const nextOffset = reset ? 0 : offset;
      const [p, l] = await Promise.all([
        api<Product[]>(`inventory/products?limit=${limit}&offset=${nextOffset}`),
        reset ? api<Level[]>("inventory/stock/levels") : Promise.resolve(levels)
      ]);

      setLevels(l);
      setItems((prev) => (reset ? p : [...prev, ...p]));
      setOffset(nextOffset + p.length);
      setHasMore(p.length === limit);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    void load({ reset: true });
  }, []);

  async function create() {
    try {
      setError(null);
      await api("inventory/products", { method: "POST", body: JSON.stringify(form) });
      setForm({
        sku: "",
        name: "",
        description: "",
        image_url: "",
        unit: "pcs",
        reorder_level: 10,
        unit_cost: 0,
        sell_price: 0,
        currency: "USD",
        is_published: false
      });
      await load({ reset: true });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function togglePublish(p: Product) {
    try {
      setError(null);
      await api(`inventory/products/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_published: !p.is_published })
      });
      await load({ reset: true });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function adjustStock(productId: string, delta: number) {
    try {
      setError(null);
      await api("inventory/stock/movements", {
        method: "POST",
        body: JSON.stringify({ product_id: productId, quantity_delta: delta, reason: "adjustment" })
      });
      await load({ reset: true });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function openQr(p: Product) {
    try {
      setError(null);
      const res = await fetch(`/api/proxy/inventory/products/${p.id}/qr`, { cache: "no-store" });
      const contentType = res.headers.get("content-type") ?? "";
      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error?.message ?? "Request failed");
        }
        throw new Error("Request failed");
      }
      const svg = await res.text();
      setQr({ product: p, svg });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const levelByProduct = new Map(levels.map((l) => [l.product_id, l]));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-lg font-semibold tracking-tight">Products</div>
          <div className="text-sm text-[hsl(var(--c-muted-2))]">Track stock movements, pricing, and publishing.</div>
        </div>
        <a href="/inventory/suppliers" className="text-sm text-[hsl(var(--c-accent))] hover:underline">
          Suppliers →
        </a>
      </div>

      {error && <Card className="border border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-8">
          <Input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <Input
            placeholder="Reorder"
            type="number"
            value={form.reorder_level}
            onChange={(e) => setForm({ ...form, reorder_level: Number(e.target.value) })}
          />
          <Input
            placeholder="Unit cost"
            type="number"
            value={form.unit_cost}
            onChange={(e) => setForm({ ...form, unit_cost: Number(e.target.value) })}
          />
          <Input
            placeholder="Sell price"
            type="number"
            value={form.sell_price}
            onChange={(e) => setForm({ ...form, sell_price: Number(e.target.value) })}
          />
          <Input
            placeholder="Currency"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase().slice(0, 3) })}
          />
          <Button onClick={create}>Add</Button>
        </div>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[hsl(var(--c-muted-2))]">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">On hand</th>
                <th className="px-4 py-3">Reorder</th>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="px-4 py-10 text-[hsl(var(--c-muted-2))]" colSpan={7}>
                    Loading products…
                  </td>
                </tr>
              )}
              {items.map((p) => {
                const lvl = levelByProduct.get(p.id);
                return (
                  <tr key={p.id} className="border-t border-[hsl(var(--c-border))]">
                    <td className="px-4 py-3 font-medium">{p.sku}</td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3 text-[hsl(var(--c-muted))]">
                      {p.currency} {Number(p.sell_price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={lvl?.needs_reorder ? "text-[hsl(var(--c-accent-2))]" : "text-[hsl(var(--c-muted))]"}>
                        {lvl?.on_hand ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--c-muted-2))]">{p.reorder_level}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" onClick={() => togglePublish(p)}>
                        {p.is_published ? "Published" : "Hidden"}
                      </Button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => adjustStock(p.id, 10)}>
                          +10
                        </Button>
                        <Button variant="ghost" onClick={() => adjustStock(p.id, -5)}>
                          -5
                        </Button>
                        <Button variant="ghost" onClick={() => openQr(p)}>
                          QR
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && items.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-[hsl(var(--c-muted-2))]" colSpan={7}>
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {items.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-[hsl(var(--c-muted-2))]">Showing {items.length}{hasMore ? "+" : ""} products</div>
          {hasMore && (
            <Button variant="secondary" disabled={loadingMore} onClick={() => load({ reset: false })}>
              {loadingMore ? "Loading…" : "Load more"}
            </Button>
          )}
        </div>
      )}

      {qr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setQr(null)} role="button" aria-label="Close QR" />
          <Card className="relative w-full max-w-md p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Product QR</div>
                <div className="mt-1 text-xs text-[hsl(var(--c-muted-2))]">
                  {qr.product.sku} • {qr.product.name}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setQr(null)}>
                Close
              </Button>
            </div>
            <div
              className="mt-4 flex justify-center rounded-2xl border border-[hsl(var(--c-border))] bg-white p-4"
              dangerouslySetInnerHTML={{ __html: qr.svg }}
            />
            <div className="mt-3 text-xs text-[hsl(var(--c-muted-2))]">
              Print and stick on shelves/boxes. Scanning shows SKU + name.
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
