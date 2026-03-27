"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { useMe, hasPermission } from "@/lib/me";

type Supplier = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export default function SuppliersPage() {
  const meQ = useMe();
  const canManage = useMemo(() => hasPermission(meQ.data ?? null, "inventory.manage"), [meQ.data]);

  const [items, setItems] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  async function load() {
    try {
      setError(null);
      const data = await api<Supplier[]>("inventory/suppliers");
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
      await api("inventory/suppliers", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", email: "", phone: "" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-lg font-semibold tracking-tight">Suppliers</div>
          <div className="text-sm text-[hsl(var(--c-muted-2))]">Manage supplier directory and contacts.</div>
        </div>
        <Link href="/inventory/products" className="text-sm text-[hsl(var(--c-accent))] hover:underline">
          Products →
        </Link>
      </div>

      {error && <Card className="border border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input placeholder="Supplier name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Button onClick={create} disabled={!canManage || !form.name.trim()}>
            Add
          </Button>
        </div>
        {!canManage && (
          <div className="mt-3 text-xs text-[hsl(var(--c-muted-2))]">Read-only access: ask an admin for `inventory.manage`.</div>
        )}
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[hsl(var(--c-muted-2))]">
              <tr>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-t border-[hsl(var(--c-border))]">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,hsl(var(--c-accent-2))_16%,transparent)]">
                        <Building2 className="h-4 w-4 text-[hsl(var(--c-accent-2))]" />
                      </span>
                      {s.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--c-muted))]">{s.email || "—"}</td>
                  <td className="px-4 py-3 text-[hsl(var(--c-muted))]">{s.phone || "—"}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-[hsl(var(--c-muted-2))]" colSpan={3}>
                    No suppliers yet.
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

