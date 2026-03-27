"use client";

import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { IconTrendingUp, IconTrendingDown, IconBox, IconInventory, IconHR, IconOrders, IconFinance } from "@/components/icons/AppIcons";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useMe } from "@/lib/me";
import { getNavItems } from "@/components/layout/nav";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CHART_COLORS = {
  primary: "#6366F1",
  secondary: "#22D3EE",
  tertiary: "#F97316",
  success: "#22C55E",
  danger: "#EF4444",
  purple: "#A855F7",
  pink: "#EC4899"
};

const revenueData = [
  { month: "Jan", revenue: 4200, expenses: 2800 },
  { month: "Feb", revenue: 5100, expenses: 3100 },
  { month: "Mar", revenue: 4800, expenses: 2900 },
  { month: "Apr", revenue: 6200, expenses: 3400 },
  { month: "May", revenue: 5800, expenses: 3200 },
  { month: "Jun", revenue: 7200, expenses: 3800 },
];

const orderData = [
  { name: "Mon", orders: 24, value: 1200 },
  { name: "Tue", orders: 31, value: 1580 },
  { name: "Wed", orders: 28, value: 1420 },
  { name: "Thu", orders: 35, value: 1890 },
  { name: "Fri", orders: 42, value: 2200 },
  { name: "Sat", orders: 18, value: 890 },
  { name: "Sun", orders: 12, value: 560 },
];

const inventoryData = [
  { name: "Coffee Beans", stock: 85, threshold: 20 },
  { name: "Tea Leaves", stock: 72, threshold: 30 },
  { name: "Packaging", stock: 45, threshold: 50 },
  { name: "Supplies", stock: 93, threshold: 25 },
];

const departmentData = [
  { name: "Operations", value: 35, color: CHART_COLORS.primary },
  { name: "Sales", value: 28, color: CHART_COLORS.secondary },
  { name: "Finance", value: 20, color: CHART_COLORS.tertiary },
  { name: "HR", value: 17, color: CHART_COLORS.success },
];

function AppTile({
  href,
  label,
  icon: Icon,
  colors
}: {
  href: string;
  label: string;
  icon: any;
  colors: { a: string; b: string };
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ["--app-a" as any]: colors.a, ["--app-b" as any]: colors.b } as any}
      className="group flex min-w-0 flex-col items-center gap-2"
    >
      <div
        className={cn(
          "app-sheen relative grid h-[70px] w-[70px] place-items-center rounded-[22px] border border-[hsl(var(--c-border))]",
          "bg-[linear-gradient(135deg,color-mix(in_oklab,var(--app-a)_22%,transparent),color-mix(in_oklab,var(--app-b)_22%,transparent))]",
          "shadow-[0_10px_30px_-18px_color-mix(in_oklab,var(--app-b)_35%,transparent)]",
          "transition duration-200 ease-ease-out group-active:scale-[0.98] group-hover:brightness-[1.04]"
        )}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.20),transparent_60%)] opacity-70" />
        <Icon className="relative h-7 w-7" />
      </div>
      <div className="w-full truncate text-center text-[11px] font-medium text-[hsl(var(--c-muted))] group-hover:text-[hsl(var(--c-text))]">
        {label}
      </div>
    </a>
  );
}

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color
}: {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: any;
  color: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-[hsl(var(--c-muted-2))]">{title}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
          <div className={cn(
            "mt-1 flex items-center gap-1 text-xs font-medium",
            changeType === "up" ? "text-green-500" : "text-red-500"
          )}>
            {changeType === "up" ? <IconTrendingUp className="h-3 w-3" /> : <IconTrendingDown className="h-3 w-3" />}
            {change}
          </div>
        </div>
        <div
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${color}22, ${color}11)`,
            border: `1px solid ${color}33`
          }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
    </Card>
  );
}

function RevenueChart() {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold tracking-tight">Revenue Overview</div>
          <div className="text-xs text-[hsl(var(--c-muted-2))]">Monthly performance</div>
        </div>
        <Badge variant="accent">+18.2%</Badge>
      </div>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.tertiary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.tertiary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--c-border))" opacity={0.3} />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(var(--c-muted))", fontSize: 11 }}
              axisLine={{ stroke: "hsl(var(--c-border))" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(var(--c-muted))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `KES${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--c-surface))",
                border: "1px solid hsl(var(--c-border))",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
              }}
              labelStyle={{ color: "hsl(var(--c-text))", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke={CHART_COLORS.tertiary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpenses)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function OrdersChart() {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold tracking-tight">Weekly Orders</div>
          <div className="text-xs text-[hsl(var(--c-muted-2))]">Order volume by day</div>
        </div>
        <Badge variant="success">+12.5%</Badge>
      </div>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={orderData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--c-border))" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(var(--c-muted))", fontSize: 11 }}
              axisLine={{ stroke: "hsl(var(--c-border))" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(var(--c-muted))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--c-surface))",
                border: "1px solid hsl(var(--c-border))",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
              }}
              labelStyle={{ color: "hsl(var(--c-text))", fontWeight: 600 }}
            />
            <Bar
              dataKey="orders"
              fill={CHART_COLORS.secondary}
              radius={[6, 6, 0, 0]}
              animationDuration={400}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function DepartmentChart() {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <div className="text-sm font-semibold tracking-tight">Department Distribution</div>
        <div className="text-xs text-[hsl(var(--c-muted-2))]">Employee allocation</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-[160px] w-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--c-surface))",
                  border: "1px solid hsl(var(--c-border))",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {departmentData.map((dept) => (
            <div key={dept.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                <span className="text-xs text-[hsl(var(--c-muted))]">{dept.name}</span>
              </div>
              <span className="text-xs font-semibold">{dept.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function InventoryStatus() {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold tracking-tight">Inventory Status</div>
          <div className="text-xs text-[hsl(var(--c-muted-2))]">Stock levels</div>
        </div>
        <Badge variant="warning">2 Low</Badge>
      </div>
      <div className="space-y-3">
        {inventoryData.map((item) => (
          <div key={item.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">{item.name}</span>
              <span className={cn(
                "text-xs font-semibold",
                item.stock < item.threshold ? "text-red-500" : "text-green-500"
              )}>
                {item.stock}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-[hsl(var(--c-surface-2))] overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  item.stock < item.threshold ? "bg-red-500" : "bg-green-500"
                )}
                style={{ width: `${Math.min(item.stock, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SmoothScrollContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>{children}</div>
  );
}

export default function DashboardPage() {
  const meQ = useMe();
  const apps = useMemo(() => {
    const items = getNavItems(meQ.data ?? null);
    return items.filter((i) => !i.href.startsWith("/admin") && i.href !== "/dashboard");
  }, [meQ.data]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    let timeGreeting = "Good morning";
    if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
    else if (hour >= 17) timeGreeting = "Good evening";
    
    // Add user's first name to the greeting
    const userName = meQ.data?.full_name?.split(" ")[0] || "";
    return userName ? `${timeGreeting}, ${userName}` : timeGreeting;
  }, [meQ.data?.full_name]);

  return (
    <SmoothScrollContainer className="h-full">
      <div className="space-y-6 p-1">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-xl font-semibold tracking-tight">{greeting}</div>
              <Badge variant="accent" className="hidden md:inline-flex">Live</Badge>
            </div>
            <div className="mt-1 text-sm text-[hsl(var(--c-muted-2))]">
              Here's what's happening with your business today.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.open("/insights", "_blank")}>
              Insights
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => window.open("/commerce/orders", "_blank")}>
              New order
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value="KES 4.8M"
            change="+18.2% from last month"
            changeType="up"
            icon={IconFinance}
            color={CHART_COLORS.primary}
          />
          <StatCard
            title="Active Orders"
            value="156"
            change="+12.5% from last week"
            changeType="up"
            icon={IconOrders}
            color={CHART_COLORS.secondary}
          />
          <StatCard
            title="Inventory Items"
            value="2,847"
            change="-3 from yesterday"
            changeType="down"
            icon={IconBox}
            color={CHART_COLORS.tertiary}
          />
          <StatCard
            title="Total Employees"
            value="42"
            change="+2 this month"
            changeType="up"
            icon={IconHR}
            color={CHART_COLORS.success}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <RevenueChart />
          <OrdersChart />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <DepartmentChart />
          <InventoryStatus />
        </div>

        <div className="lg:hidden">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold tracking-tight">Applications</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-5">
              {apps.map((a) => (
                <AppTile key={a.href} href={a.href} label={a.label} icon={a.icon} colors={a.colors} />
              ))}
              {apps.length === 0 && <div className="col-span-full text-sm text-[hsl(var(--c-muted-2))]">No applications available.</div>}
            </div>
          </Card>
        </div>

        <div className="hidden lg:block">
          <Card className="p-5">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <div className="text-sm font-semibold tracking-tight">Applications</div>
              </div>
            </div>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
              {apps.map((a) => {
                const Icon = a.icon;
                return (
                  <a
                    key={a.href}
                    href={a.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ["--app-a" as any]: a.colors.a, ["--app-b" as any]: a.colors.b } as any}
                    className="app-sheen hairline min-w-0 rounded-2xl bg-[linear-gradient(135deg,color-mix(in_oklab,var(--app-a)_8%,transparent),color-mix(in_oklab,var(--app-b)_8%,transparent))] p-4 transition duration-200 ease-ease-out hover:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--app-a)_12%,transparent),color-mix(in_oklab,var(--app-b)_12%,transparent))]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[hsl(var(--c-border))] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--app-a)_26%,transparent),color-mix(in_oklab,var(--app-b)_26%,transparent))]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 text-sm font-semibold truncate">{a.label}</div>
                    </div>
                  </a>
                );
              })}
              {apps.length === 0 && <div className="col-span-full text-sm text-[hsl(var(--c-muted-2))]">No applications available.</div>}
            </div>
          </Card>
        </div>
      </div>
    </SmoothScrollContainer>
  );
}
