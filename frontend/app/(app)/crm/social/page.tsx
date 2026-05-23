"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

type Touchpoint = {
  id: string;
  customer_id: string;
  platform: string;
  direction: string;
  status: string;
  content_preview: string;
};

export default function CrmSocialPage() {
  const [items, setItems] = useState<Touchpoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customer_id: "",
    platform: "whatsapp",
    recipient: "",
    message: "",
  });

  async function load() {
    try {
      setError(null);
      const data = await api<Touchpoint[]>("crm/social-touchpoints");
      setItems(data);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function dispatch() {
    try {
      setError(null);
      await api("crm/social-dispatch", { method: "POST", body: JSON.stringify(form) });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">CRM Social Tracking</div>
        <div className="text-sm text-white/50">Track WhatsApp and social conversations tied to customers.</div>
      </div>

      {error && <Card className="border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input placeholder="Customer ID" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} />
          <Input placeholder="Platform (whatsapp/facebook/...)" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} />
          <Input placeholder="Recipient" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} />
          <Input placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        <div className="mt-3">
          <Button onClick={dispatch} disabled={!form.customer_id || !form.recipient || !form.message}>Send/Track Message</Button>
        </div>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Message</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-medium">{i.platform}</td>
                  <td className="px-4 py-3 text-white/70">{i.customer_id}</td>
                  <td className="px-4 py-3 text-white/70">{i.direction}</td>
                  <td className="px-4 py-3 text-white/70">{i.status}</td>
                  <td className="px-4 py-3 text-white/70">{i.content_preview}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-white/50" colSpan={5}>No social touchpoints yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
