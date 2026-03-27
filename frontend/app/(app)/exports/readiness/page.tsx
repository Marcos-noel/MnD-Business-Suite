"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";

type Item = { code: string; title: string; status: "missing" | "partial" | "complete"; points: number; recommendation: string };
type Readiness = { score: number; items: Item[] };

export default function ExportReadinessPage() {
  const [data, setData] = useState<Readiness | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setData(await api<Readiness>("exports/readiness"));
      } catch (e) {
        setErr((e as Error).message);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Export readiness</div>
        <div className="text-sm text-[hsl(var(--c-muted-2))]">Checklist + score to prepare for international trade.</div>
      </div>

      {err && <Card className="border border-red-500/30 bg-red-500/10 text-sm">{err}</Card>}

      <Card className="p-5">
        {!data ? (
          <Skeleton className="h-10" />
        ) : (
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm font-semibold tracking-tight">Score</div>
              <div className="text-xs text-[hsl(var(--c-muted-2))]">Out of 100</div>
            </div>
            <div className="text-4xl font-semibold tracking-tight">{data.score}</div>
          </div>
        )}
      </Card>

      <Card className="space-y-3 p-5">
        {!data ? (
          <>
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
          </>
        ) : (
          data.items.map((i) => (
            <div
              key={i.code}
              className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 last:border-0 last:pb-0"
            >
              <div>
                <div className="text-sm font-medium">{i.title}</div>
                {i.status !== "complete" && i.recommendation && (
                  <div className="mt-1 text-xs text-[hsl(var(--c-muted-2))]">{i.recommendation}</div>
                )}
              </div>
              <div className="text-right">
                <Badge
                  variant={i.status === "complete" ? "success" : i.status === "partial" ? "warning" : "neutral"}
                  className="justify-end"
                >
                  {i.status}
                </Badge>
                <div className="mt-1 text-sm font-semibold">{i.points}</div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
