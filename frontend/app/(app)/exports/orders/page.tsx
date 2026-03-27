"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

type Order = {
  id: string;
  order_no: string;
  customer_id: string;
  destination_country: string;
  order_date: string;
  status: string;
};

type Doc = { id: string; kind: string; status: string; export_order_id: string };

export default function ExportOrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [docs, setDocs] = useState<Record<string, Doc[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customer_id: "",
    order_no: "",
    destination_country: "",
    order_date: new Date().toISOString().slice(0, 10),
    status: "draft"
  });

  async function load() {
    try {
      setError(null);
      const orders = await api<Order[]>("exports/orders");
      setItems(orders);
      const map: Record<string, Doc[]> = {};
      await Promise.all(
        orders.slice(0, 6).map(async (o) => {
          try {
            map[o.id] = await api<Doc[]>(`exports/documents/${o.id}`);
          } catch {
            map[o.id] = [];
          }
        })
      );
      setDocs(map);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function create() {
    try {
      setError(null);
      await api("exports/orders", { method: "POST", body: JSON.stringify(form) });
      setForm({
        customer_id: "",
        order_no: "",
        destination_country: "",
        order_date: new Date().toISOString().slice(0, 10),
        status: "draft"
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function confirm(orderId: string) {
    try {
      setError(null);
      await api(`exports/orders/${orderId}`, { method: "PATCH", body: JSON.stringify({ status: "confirmed" }) });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function requestDoc(orderId: string) {
    try {
      setError(null);
      await api("exports/documents", {
        method: "POST",
        body: JSON.stringify({ export_order_id: orderId, kind: "commercial_invoice" })
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Export orders</div>
        <div className="text-sm text-white/50">Create orders, track shipment status, and generate documents via jobs.</div>
      </div>

      {error && <Card className="border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <Input placeholder="Customer ID" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} />
          <Input placeholder="Order no" value={form.order_no} onChange={(e) => setForm({ ...form, order_no: e.target.value })} />
          <Input placeholder="Destination" value={form.destination_country} onChange={(e) => setForm({ ...form, destination_country: e.target.value })} />
          <Input type="date" value={form.order_date} onChange={(e) => setForm({ ...form, order_date: e.target.value })} />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="glass rounded-2xl px-4 py-2 text-sm">
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
          <Button onClick={create}>Create</Button>
        </div>
      </Card>

      <div className="space-y-3">
        {items.map((o) => (
          <Card key={o.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold">
                  {o.order_no} <span className="text-white/50">•</span>{" "}
                  <span className="text-white/70">{o.destination_country}</span>
                </div>
                <div className="text-xs text-white/50">
                  Status: <span className="text-white/70">{o.status}</span> • Customer:{" "}
                  <span className="text-white/70">{o.customer_id}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => confirm(o.id)} disabled={o.status !== "draft"}>
                  Confirm
                </Button>
                <Button variant="ghost" onClick={() => requestDoc(o.id)} disabled={o.status === "draft"}>
                  Generate doc
                </Button>
              </div>
            </div>

            <div className="mt-3 text-xs text-white/50">Documents</div>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              {(docs[o.id] ?? []).slice(0, 4).map((d) => (
                <div key={d.id} className="glass rounded-2xl p-3">
                  <div className="text-sm font-medium">{d.kind}</div>
                  <div className="text-xs text-white/50">Status: {d.status}</div>
                  <div className="text-xs text-white/50">Doc ID: {d.id}</div>
                </div>
              ))}
              {(docs[o.id] ?? []).length === 0 && <div className="text-sm text-white/50">No documents yet.</div>}
            </div>
          </Card>
        ))}
        {items.length === 0 && <Card className="text-sm text-white/50">No export orders yet.</Card>}
      </div>
    </div>
  );
}

