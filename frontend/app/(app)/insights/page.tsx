"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/query";

type Kpis = {
  employees: number;
  products: number;
  customers: number;
  open_opportunities: number;
  export_orders_open: number;
  revenue_30d: number;
  expenses_30d: number;
  profit_30d: number;
  low_stock_items: number;
};

type Reco = { title: string; rationale: string; impact: string };

export default function InsightsPage() {
  const kpisQ = useQuery<Kpis>("kpis", () => api<Kpis>("erp/dashboard"));
  const recsQ = useQuery<Reco[]>(
    "recs",
    async () => (await api<{ recommendations: Reco[] }>("assistant/recommendations")).recommendations
  );

  const kpis = kpisQ.data ?? null;
  const recs = recsQ.data ?? null;
  const err = kpisQ.error ?? recsQ.error ?? null;

  const chart = useMemo(() => {
    if (!kpis) return [];
    const profit = kpis.profit_30d;
    return [
      { name: "Revenue", value: kpis.revenue_30d },
      { name: "Expenses", value: kpis.expenses_30d },
      { name: "Profit", value: profit }
    ];
  }, [kpis]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-xl font-semibold tracking-tight">Insights</div>
            <Badge variant="accent" className="hidden md:inline-flex">
              <Sparkles className="h-3.5 w-3.5" />
              AI-ready
            </Badge>
          </div>
          <div className="mt-1 text-sm text-[hsl(var(--c-muted-2))]">KPIs and charts across finance, inventory, and sales.</div>
        </div>
      </div>

      {err && (
        <Card className="border border-red-500/30 bg-red-500/10">
          <div className="text-sm">{err}</div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Employees", value: kpis?.employees },
          { label: "Products", value: kpis?.products },
          { label: "Customers", value: kpis?.customers },
          { label: "Low stock", value: kpis?.low_stock_items }
        ].map((x) => (
          <Card key={x.label} className="relative overflow-hidden p-5">
            <div className="text-xs text-[hsl(var(--c-muted-2))]">{x.label}</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">
              {x.value == null ? <Skeleton className="h-8 w-24" /> : x.value}
            </div>
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[hsl(var(--c-accent))] opacity-10 blur-3xl" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 p-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="text-sm font-semibold tracking-tight">Finance overview</div>
              <div className="text-xs text-[hsl(var(--c-muted-2))]">Revenue vs expenses vs profit (30 days)</div>
            </div>
            {kpis ? (
              <div className="text-right">
                <div className="text-xs text-[hsl(var(--c-muted-2))]">Profit</div>
                <div className="text-lg font-semibold tracking-tight">{kpis.profit_30d.toFixed(2)}</div>
              </div>
            ) : (
              <Skeleton className="h-10 w-28" />
            )}
          </div>
          <div className="h-64">
            {kpis ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--c-accent))" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="hsl(var(--c-accent))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="rgba(255,255,255,0.45)" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,10,14,0.85)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 16
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--c-accent))" fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
              </div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-2 text-sm font-semibold tracking-tight">AI recommendations</div>
          <div className="text-xs text-[hsl(var(--c-muted-2))]">Actionable next steps</div>
          <div className="mt-4 space-y-3">
            {!recs ? (
              <>
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
              </>
            ) : (
              recs.slice(0, 5).map((r) => (
                <div key={r.title} className="rounded-2xl border border-[hsl(var(--c-border))] bg-white/5 p-3">
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="mt-1 text-xs text-[hsl(var(--c-muted-2))]">{r.rationale}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

