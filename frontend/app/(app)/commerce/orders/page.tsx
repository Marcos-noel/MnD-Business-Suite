"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";

type Product = { id: string; sku: string; name: string; sell_price: number; currency: string; is_published: boolean };
type OrderItem = { product_id: string; quantity: number };

type Order = {
  id: string;
  order_no: string;
  customer_name: string;
  currency: string;
  total: number;
  status: string;
  payment_status: string;
};

export default function CommerceOrdersPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("Walk-in");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [qty, setQty] = useState(1);

  const items: OrderItem[] = useMemo(
    () => (selectedProductId ? [{ product_id: selectedProductId, quantity: qty }] : []),
    [selectedProductId, qty]
  );

  async function load() {
    try {
      setError(null);
      const [p, o] = await Promise.all([api<Product[]>("inventory/products"), api<any[]>("commerce/orders")]);
      setProducts(p);
      setOrders(
        (o ?? []).map((x) => ({
          id: x.id,
          order_no: x.order_no,
          customer_name: x.customer_name,
          currency: x.currency,
          total: x.total,
          status: x.status,
          payment_status: x.payment_status
        }))
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createAndPay() {
    try {
      setError(null);
      const created = await api<any>("commerce/orders", {
        method: "POST",
        body: JSON.stringify({ customer_name: customerName, items })
      });
      await api(`commerce/orders/${created.id}/pay`, { method: "POST", body: JSON.stringify({ provider: "cash" }) });
      setSelectedProductId("");
      setQty(1);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Orders</div>
        <div className="text-sm text-[hsl(var(--c-muted-2))]">Create and collect payments (cash/mpesa/stripe ready).</div>
      </div>

      {error && <Card className="border border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <Card>
        {!products ? (
          <Skeleton className="h-10" />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" />
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="focus-ring h-10 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-[hsl(var(--c-text))] backdrop-blur-xl"
            >
              <option value="">Select product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name} ({p.currency} {Number(p.sell_price).toFixed(2)})
                </option>
              ))}
            </select>
            <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            <Button onClick={createAndPay} disabled={!selectedProductId}>
              Create + Pay
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[hsl(var(--c-muted-2))]">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {!orders ? (
                <tr>
                  <td className="px-4 py-10" colSpan={5}>
                    <Skeleton className="h-6" />
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-t border-white/10">
                    <td className="px-4 py-3 font-medium">{o.order_no}</td>
                    <td className="px-4 py-3">{o.customer_name || "—"}</td>
                    <td className="px-4 py-3">
                      {o.currency} {Number(o.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">{o.payment_status}</td>
                    <td className="px-4 py-3 text-[hsl(var(--c-muted))]">{o.status}</td>
                  </tr>
                ))
              )}
              {orders?.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-[hsl(var(--c-muted-2))]" colSpan={5}>
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
