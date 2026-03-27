"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

type QrResp = { token: string; svg: string; action: string; expires_seconds: number };

export default function HrQrPage() {
  const [data, setData] = useState<QrResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const next = await api<QrResp>("hr/qr/clock?expires_seconds=90");
      setData(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-lg font-semibold tracking-tight">HR Clock QR</div>
          <div className="text-sm text-[hsl(var(--c-muted-2))]">
            Display this QR at the office entrance. Staff scan it in <span className="font-medium">My HR</span> to clock in/out.
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error && <Card className="border border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <Card className="p-6">
        {!data ? (
          <div className="text-sm text-[hsl(var(--c-muted-2))]">Loading QR…</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-center">
            <div className="rounded-3xl border border-[hsl(var(--c-border))] bg-white p-6">
              <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: data.svg }} />
            </div>
            <div className="space-y-3">
              <div className="text-sm font-semibold">How it works</div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-[hsl(var(--c-muted-2))]">
                <li>Employee logs in → opens My HR → taps “Scan QR”.</li>
                <li>Scan toggles: clock-in if not clocked, clock-out if already clocked in.</li>
                <li>QR rotates automatically every 90 seconds.</li>
              </ul>
              <div className="rounded-2xl border border-[hsl(var(--c-border))] p-3">
                <div className="text-xs text-[hsl(var(--c-muted-2))]">Token TTL</div>
                <div className="mt-1 text-sm font-semibold">{data.expires_seconds}s</div>
              </div>
              <div className="text-xs text-[hsl(var(--c-muted-2))]">
                Tip: Put this page on a wall-mounted tablet, or display it on a TV.
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

