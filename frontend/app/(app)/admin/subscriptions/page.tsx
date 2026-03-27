"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

type Mod = {
  module_code: string;
  is_enabled: boolean;
  plan: string;
  subscribed_until: string | null;
};

const LABELS: Record<string, string> = {
  erp: "ERP",
  hr: "HR",
  inventory: "Inventory",
  crm: "CRM",
  commerce: "Commerce",
  finance: "Finance",
  exports: "Exports",
  analytics: "Analytics",
  assistant: "Assistant",
  admin: "Admin"
};

export default function SubscriptionsPage() {
  const [items, setItems] = useState<Mod[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const data = await api<Mod[]>("billing/modules");
      setItems(data);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function toggle(code: string, next: boolean) {
    try {
      setBusy(code);
      setError(null);
      await api(`billing/modules/${code}`, { method: "PATCH", body: JSON.stringify({ is_enabled: next }) });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold tracking-tight">Subscriptions</div>
        <div className="text-sm text-[hsl(var(--c-muted-2))]">
          Enable/disable modules for this organization. Disabled modules disappear from navigation and APIs return 403.
        </div>
      </div>

      {error && <Card className="border border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[hsl(var(--c-muted-2))]">
              <tr>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.module_code} className="border-t border-[hsl(var(--c-border))]">
                  <td className="px-4 py-3 font-medium">{LABELS[m.module_code] ?? m.module_code}</td>
                  <td className="px-4 py-3 text-[hsl(var(--c-muted))]">{m.plan}</td>
                  <td className="px-4 py-3 text-[hsl(var(--c-muted))]">{m.is_enabled ? "Enabled" : "Disabled"}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant={m.is_enabled ? "ghost" : "secondary"}
                      onClick={() => toggle(m.module_code, !m.is_enabled)}
                      disabled={busy === m.module_code}
                    >
                      {m.is_enabled ? "Disable" : "Enable"}
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-[hsl(var(--c-muted-2))]" colSpan={4}>
                    No modules found.
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

