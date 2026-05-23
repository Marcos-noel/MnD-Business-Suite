"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

type Quote = {
  id: string;
  quote_no: string;
  status: string;
  customer_id: string;
  currency: string;
  total: number;
};

export default function CrmQuotesPage() {
  const [items, setItems] = useState<Quote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customer_id: "",
    opportunity_id: "",
    currency: "USD",
    tax: "0",
    discount: "0",
    notes: "",
    item_name: "",
    quantity: "1",
    unit_price: "0",
  });

  async function load() {
    try {
      setError(null);
      const data = await api<Quote[]>("crm/quotes");
      setItems(data);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createQuote() {
    try {
      setError(null);
      await api("crm/quotes", {
        method: "POST",
        body: JSON.stringify({
          customer_id: form.customer_id,
          opportunity_id: form.opportunity_id || null,
          currency: form.currency,
          tax: Number(form.tax),
          discount: Number(form.discount),
          notes: form.notes,
          lines: [{ item_name: form.item_name, quantity: Number(form.quantity), unit_price: Number(form.unit_price) }],
        }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">CRM Quotes</div>
        <div className="text-sm text-white/50">Create and track quotes, then send to clients by email.</div>
      </div>

      {error && <Card className="border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input placeholder="Customer ID" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} />
          <Input placeholder="Opportunity ID (optional)" value={form.opportunity_id} onChange={(e) => setForm({ ...form, opportunity_id: e.target.value })} />
          <Input placeholder="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          <Input placeholder="Item name" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} />
          <Input placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <Input placeholder="Unit price" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
          <Input placeholder="Tax" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} />
          <Input placeholder="Discount" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
        </div>
        <div className="mt-3 flex gap-2">
          <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button onClick={createQuote} disabled={!form.customer_id || !form.item_name}>Create Quote</Button>
        </div>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="px-4 py-3">Quote</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((q) => (
                <tr key={q.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-medium">{q.quote_no}</td>
                  <td className="px-4 py-3 text-white/70">{q.customer_id}</td>
                  <td className="px-4 py-3 text-white/70">{q.status}</td>
                  <td className="px-4 py-3 text-white/70">{q.currency} {q.total}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-white/50" colSpan={4}>No quotes yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
