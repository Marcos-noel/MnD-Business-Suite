"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

type Tx = {
  id: string;
  day: string;
  kind: "revenue" | "expense";
  category: string;
  provider: string;
  reference: string;
  amount: number;
  description: string;
};

export default function TransactionsPage() {
  const [items, setItems] = useState<Tx[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    day: new Date().toISOString().slice(0, 10),
    kind: "revenue",
    category: "general",
    amount: 0,
    description: ""
  });
  const [pay, setPay] = useState({ amount: 0, provider: "cash", reference: "", description: "Payment received" });

  async function load() {
    try {
      setError(null);
      const data = await api<Tx[]>("finance/transactions");
      setItems(data);
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
      await api("finance/transactions", {
        method: "POST",
        body: JSON.stringify({ ...form, amount: Number(form.amount), provider: "manual", reference: "" })
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function collect() {
    try {
      setError(null);
      await api("finance/payments/collect", { method: "POST", body: JSON.stringify({ ...pay, amount: Number(pay.amount) }) });
      setPay({ amount: 0, provider: "cash", reference: "", description: "Payment received" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Transactions</div>
        <div className="text-sm text-white/50">Track revenue, expenses, and collect payments via strategies.</div>
      </div>

      {error && <Card className="border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <div className="mb-3 text-sm font-semibold">Manual transaction</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <Input type="date" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} />
            <select
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value })}
              className="glass rounded-2xl px-4 py-2 text-sm"
            >
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
            </select>
            <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            <Button onClick={create}>Add</Button>
          </div>
          <div className="mt-3">
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </Card>

        <Card>
          <div className="mb-3 text-sm font-semibold">Collect payment</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <Input type="number" placeholder="Amount" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: Number(e.target.value) })} />
            <select
              value={pay.provider}
              onChange={(e) => setPay({ ...pay, provider: e.target.value })}
              className="glass rounded-2xl px-4 py-2 text-sm"
            >
              <option value="cash">Cash</option>
              <option value="mobile_money">Mobile money</option>
              <option value="bank">Bank</option>
            </select>
            <Input placeholder="Reference" value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} />
            <Input placeholder="Description" value={pay.description} onChange={(e) => setPay({ ...pay, description: e.target.value })} />
            <Button onClick={collect}>Collect</Button>
          </div>
        </Card>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Kind</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-t border-white/10">
                  <td className="px-4 py-3 text-white/70">{t.day}</td>
                  <td className="px-4 py-3">{t.kind}</td>
                  <td className="px-4 py-3 text-white/70">{t.category}</td>
                  <td className="px-4 py-3 text-white/70">{t.provider}</td>
                  <td className="px-4 py-3 text-white/70">{t.reference}</td>
                  <td className="px-4 py-3 font-medium">{Number(t.amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-white/70">{t.description}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-white/50" colSpan={7}>
                    No transactions yet.
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

