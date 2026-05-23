"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

type AuditEvent = {
  id: string;
  created_at: string;
  action: string;
  entity_type: string;
  summary: string;
};

export default function CrmActivityPage() {
  const [items, setItems] = useState<AuditEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [liveCount, setLiveCount] = useState(0);

  async function load() {
    try {
      setError(null);
      const data = await api<AuditEvent[]>("crm/audit-feed");
      setItems(data);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/proxy/crm/stream");
    es.onmessage = () => setLiveCount((v) => v + 1);
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, []);

  const badge = useMemo(() => (liveCount > 0 ? `Realtime events: ${liveCount}` : "Realtime connected"), [liveCount]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">CRM Activity Feed</div>
        <div className="text-sm text-white/50">Audit trail + realtime CRM activity stream.</div>
      </div>

      <Card className="text-sm">{badge}</Card>
      {error && <Card className="border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Summary</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-t border-white/10">
                  <td className="px-4 py-3 text-white/70">{new Date(i.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-white/70">{i.entity_type}</td>
                  <td className="px-4 py-3 text-white/70">{i.action}</td>
                  <td className="px-4 py-3 font-medium">{i.summary}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-white/50" colSpan={4}>No activity yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
