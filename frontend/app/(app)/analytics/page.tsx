"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";

type Point = { day: string; revenue: number; expenses: number; profit: number };
type Top = { product_name: string; quantity: number; amount: number };
type Overview = { series: Point[]; top_products: Top[] };

export default function AnalyticsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setData(await api<Overview>("analytics/overview?days=30"));
      } catch (e) {
        setErr((e as Error).message);
      }
    })();
  }, []);

  const series = useMemo(() => data?.series ?? [], [data]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Analytics</div>
        <div className="text-sm text-[hsl(var(--c-muted-2))]">Revenue, expenses, profit, and top products.</div>
      </div>

      {err && <Card className="border border-red-500/30 bg-red-500/10 text-sm">{err}</Card>}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 p-5">
          <div className="mb-3">
            <div className="text-sm font-semibold tracking-tight">Profit trend</div>
            <div className="text-xs text-[hsl(var(--c-muted-2))]">Finance transactions aggregated by day (30 days)</div>
          </div>
          <div className="h-64">
            {!data ? (
              <div className="space-y-2">
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--c-accent))" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="hsl(var(--c-accent))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.45)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="rgba(255,255,255,0.45)" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,10,14,0.85)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 16
                    }}
                  />
                  <Area type="monotone" dataKey="profit" stroke="hsl(var(--c-accent))" fill="url(#profitGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-2 text-sm font-semibold tracking-tight">Top products</div>
          <div className="text-xs text-[hsl(var(--c-muted-2))]">From paid commerce orders</div>
          <div className="mt-4 space-y-2">
            {!data ? (
              <>
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
              </>
            ) : data.top_products.length === 0 ? (
              <div className="text-sm text-[hsl(var(--c-muted))]">No paid orders yet.</div>
            ) : (
              data.top_products.map((t) => (
                <motion.div key={t.product_name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{t.product_name}</div>
                    <div className="text-xs text-[hsl(var(--c-muted-2))]">{t.quantity} pcs</div>
                  </div>
                  <div className="text-xs text-[hsl(var(--c-muted-2))]">Amount: {t.amount.toFixed(2)}</div>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
