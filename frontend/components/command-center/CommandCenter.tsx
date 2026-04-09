"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";
import { useMe } from "@/lib/me";
import { formatCurrency } from "@/lib/format";
import {
  IconTrendingUp,
  IconBox,
  IconOrders,
  IconFinance,
  IconAnalytics,
  IconAssistant,
  IconPlus,
  IconArrowRight,
  IconCheck,
  IconTime,
  IconCalendar,
  IconSearch,
  IconClose,
  IconBell,
  IconHome,
  IconProfile
} from "@/components/icons/AppIcons";
import { Sparkles } from "lucide-react";

// Types for AI insights
interface Recommendation {
  title: string;
  rationale: string;
  impact: string;
}

interface Forecast {
  revenue_next_30d: number;
  expenses_next_30d: number;
  confidence: number;
}

interface Analytics {
  top_customers: string[];
  pipeline_value: number;
  low_stock_skus: string[];
}

// Command item types
interface CommandItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "navigation" | "action" | "ai";
  action: () => void;
  keywords?: string[];
}

// AI Command Center Component
export function AICommandCenter() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const meQ = useMe();

  useEffect(() => {
    async function fetchAIData() {
      try {
        const [recs, fc, an] = await Promise.all([
          api<{ recommendations: Recommendation[] }>("/assistant/recommendations"),
          api<Forecast>("/assistant/forecast"),
          api<Analytics>("/assistant/analytics")
        ]);
        setRecommendations(recs.recommendations);
        setForecast(fc);
        setAnalytics(an);
      } catch (e) {
        console.debug("AI data unavailable, using defaults");
      } finally {
        setLoading(false);
      }
    }
    fetchAIData();
  }, []);

  const insights = [
    {
      icon: IconTrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      text: forecast 
        ? `${formatCurrency(forecast.revenue_next_30d)} projected for next month`
        : "Revenue up 18% this month",
      trend: "up" as const
    },
    {
      icon: analytics?.low_stock_skus?.length ? IconBell : IconCheck,
      color: analytics?.low_stock_skus?.length ? "text-amber-500" : "text-emerald-500",
      bgColor: analytics?.low_stock_skus?.length ? "bg-amber-500/10" : "bg-emerald-500/10",
      text: analytics?.low_stock_skus?.length 
        ? `${analytics.low_stock_skus.length} inventory items low - restock needed`
        : "Inventory levels healthy",
      trend: analytics?.low_stock_skus?.length ? "warning" as const : "up" as const
    },
    {
      icon: IconAnalytics,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      text: analytics?.pipeline_value 
        ? `Pipeline value: ${formatCurrency(analytics.pipeline_value)}`
        : "24 active opportunities in pipeline",
      trend: "neutral" as const
    }
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-glass">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">AI Command Center</h2>
            <p className="text-xs text-[hsl(var(--c-muted-2))]">
              {meQ.data?.org_name ? `${meQ.data.org_name} Business Intelligence` : 'Business Intelligence'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
          <span className="text-xs font-medium text-emerald-500">Live</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "group relative overflow-hidden rounded-xl p-4 transition-all hover:shadow-elevate",
                insight.bgColor
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("rounded-lg p-2", insight.bgColor)}>
                  <Icon className={cn("h-4 w-4", insight.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{insight.text}</p>
                  <div className={cn(
                    "mt-1 text-xs font-semibold",
                    insight.trend === "up" && "text-emerald-500",
                    insight.trend === "warning" && "text-amber-500",
                    insight.trend === "neutral" && "text-muted-2"
                  )}>
                    {insight.trend === "up" && "↑ Positive"}
                    {insight.trend === "warning" && "⚠ Action needed"}
                    {insight.trend === "neutral" && "→ Monitor"}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {recommendations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            AI Recommendations
          </h3>
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center justify-between rounded-lg bg-surface-2 p-3 hover:bg-surface-3 transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{rec.title}</p>
                  <p className="text-xs text-muted truncate">{rec.rationale}</p>
                </div>
                <div className="ml-3 flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-emerald-500">{rec.impact}</span>
                  <IconArrowRight className="h-4 w-4 text-muted" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Command Palette Component
export function CommandPaletteModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: IconHome, keywords: ["home", "overview", "main"] },
    { href: "/commerce/orders", label: "Orders", icon: IconOrders, keywords: ["commerce", "sales", "invoices"] },
    { href: "/crm/customers", label: "Customers", icon: IconProfile, keywords: ["crm", "leads", "clients"] },
    { href: "/inventory/products", label: "Inventory", icon: IconBox, keywords: ["products", "stock", "items"] },
    { href: "/finance/transactions", label: "Finance", icon: IconFinance, keywords: ["transactions", "payments", "banking"] },
    { href: "/hr/employees", label: "HR", icon: IconProfile, keywords: ["employees", "staff", "payroll"] },
    { href: "/analytics", label: "Analytics", icon: IconAnalytics, keywords: ["reports", "insights", "charts"] },
    { href: "/assistant", label: "AI Assistant", icon: IconAssistant, keywords: ["ai", "chat", "help"] },
    { href: "/insights", label: "Insights", icon: IconTrendingUp, keywords: ["predictions", "ai", "intelligence"] },
  ];

  const quickActions = [
    { label: "Create Invoice", action: () => window.open("/commerce/orders?new=true", "_blank"), icon: IconOrders, keywords: ["new", "bill"] },
    { label: "Add Customer", action: () => window.open("/crm/customers?new=true", "_blank"), icon: IconProfile, keywords: ["new", "lead"] },
    { label: "Add Product", action: () => window.open("/inventory/products?new=true", "_blank"), icon: IconBox, keywords: ["new", "item"] },
    { label: "Generate Report", action: () => window.open("/analytics?report=true", "_blank"), icon: IconAnalytics, keywords: ["export", "download"] },
  ];

  const commandItems: CommandItem[] = [
    ...navItems.map(item => ({
      id: item.href,
      label: item.label,
      icon: item.icon,
      category: "navigation" as const,
      action: () => window.open(item.href, "_blank"),
      keywords: item.keywords
    })),
    ...quickActions.map(item => ({
      id: item.label,
      label: item.label,
      icon: item.icon,
      category: "action" as const,
      action: item.action,
      keywords: item.keywords
    })),
    { id: "ai-revenue", label: "Show revenue trends", icon: IconTrendingUp, category: "ai", action: () => window.open("/analytics?metric=revenue", "_blank"), keywords: ["analyze", "sales", "income"] },
    { id: "ai-forecast", label: "Predict next month sales", icon: IconCalendar, category: "ai", action: () => window.open("/insights?forecast=true", "_blank"), keywords: ["future", "predictions", "ai"] },
    { id: "ai-inventory", label: "Check inventory status", icon: IconBox, category: "ai", action: () => window.open("/inventory?alert=true", "_blank"), keywords: ["stock", "low"] },
  ];

  const filteredItems = query.trim()
    ? commandItems.filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords?.some(k => k.includes(query.toLowerCase()))
      )
    : commandItems;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        setOpen(false);
        setQuery("");
      }
    }
  }, [filteredItems, selectedIndex]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted transition-all hover:border-accent hover:text-fg"
      >
        <IconSearch className="h-4 w-4" />
        <span className="hidden sm:inline">Search apps, actions...</span>
        <span className="sm:hidden">Search...</span>
        <kbd className="ml-auto hidden rounded bg-surface-2 px-1.5 py-0.5 text-xs font-mono sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-pop"
            >
              <div className="flex items-center gap-3 border-b border-border p-4">
                <IconSearch className="h-5 w-5 text-muted" />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                />
                <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-surface-2">
                  <IconClose className="h-4 w-4 text-muted" />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-2">
                {filteredItems.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted">
                    No results found for "{query}"
                  </div>
                ) : (
                  <>
                    <div className="mb-2">
                      <div className="px-2 py-1 text-xs font-semibold uppercase text-muted">Navigation</div>
                      {filteredItems.filter(i => i.category === "navigation").map((item) => {
                        const Icon = item.icon;
                        const isSelected = filteredItems.indexOf(item) === selectedIndex;
                        return (
                          <button
                            key={item.id}
                            onClick={() => { item.action(); setOpen(false); setQuery(""); }}
                            className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left", isSelected ? "bg-accent/10 text-accent" : "hover:bg-surface-2")}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {filteredItems.filter(i => i.category === "action").length > 0 && (
                      <div className="mb-2">
                        <div className="px-2 py-1 text-xs font-semibold uppercase text-muted">Quick Actions</div>
                        {filteredItems.filter(i => i.category === "action").map((item) => {
                          const Icon = item.icon;
                          const isSelected = filteredItems.indexOf(item) === selectedIndex;
                          return (
                            <button
                              key={item.id}
                              onClick={() => { item.action(); setOpen(false); setQuery(""); }}
                              className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left", isSelected ? "bg-accent/10 text-accent" : "hover:bg-surface-2")}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {filteredItems.filter(i => i.category === "ai").length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-xs font-semibold uppercase text-muted">AI Insights</div>
                        {filteredItems.filter(i => i.category === "ai").map((item) => {
                          const Icon = item.icon;
                          const isSelected = filteredItems.indexOf(item) === selectedIndex;
                          return (
                            <button
                              key={item.id}
                              onClick={() => { item.action(); setOpen(false); setQuery(""); }}
                              className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left", isSelected ? "bg-accent/10 text-accent" : "hover:bg-surface-2")}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted">
                <div className="flex items-center gap-4">
                  <span><kbd className="rounded bg-surface-2 px-1 py-0.5">↑↓</kbd> Navigate</span>
                  <span><kbd className="rounded bg-surface-2 px-1 py-0.5">↵</kbd> Select</span>
                  <span><kbd className="rounded bg-surface-2 px-1 py-0.5">esc</kbd> Close</span>
                </div>
                <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Powered</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Quick Actions Floating Panel
interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
}

const quickActionsList: QuickAction[] = [
  { id: "invoice", label: "Create Invoice", icon: IconOrders, color: "bg-blue-500", href: "/commerce/orders?new=true" },
  { id: "customer", label: "Add Customer", icon: IconProfile, color: "bg-purple-500", href: "/crm/customers?new=true" },
  { id: "product", label: "Add Product", icon: IconBox, color: "bg-emerald-500", href: "/inventory/products?new=true" },
  { id: "report", label: "Generate Report", icon: IconAnalytics, color: "bg-amber-500", href: "/analytics?report=true" },
];

export function QuickActionsFloating() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-14 right-0 space-y-2"
          >
            {quickActionsList.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { window.open(action.href, "_blank"); setExpanded(false); }}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-elevate transition-all hover:scale-105 hover:shadow-pop"
                >
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", action.color)}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setExpanded(!expanded)}
        className={cn("flex h-14 w-14 items-center justify-center rounded-2xl shadow-pop", expanded ? "bg-muted" : "bg-accent hover:bg-accent/90")}
      >
        {expanded ? <IconClose className="h-6 w-6 text-white" /> : <IconPlus className="h-6 w-6 text-white" />}
      </motion.button>
    </div>
  );
}

// Smart Alerts Component
interface Alert {
  id: string;
  type: "info" | "warning" | "success" | "danger";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockAlerts: Alert[] = [
  { id: "1", type: "warning", title: "Low Stock Alert", message: "Coffee Beans inventory below threshold", time: "2 min ago", read: false },
  { id: "2", type: "success", title: "Payment Received", message: "KES 45,000 from Acme Corp", time: "15 min ago", read: false },
  { id: "3", type: "info", title: "New Order", message: "Order #1247 - KES 12,500", time: "1 hour ago", read: true },
  { id: "4", type: "danger", title: "Payment Failed", message: "Invoice #892 - Retry needed", time: "3 hours ago", read: false },
];

export function SmartAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted transition-all hover:border-accent hover:text-fg"
      >
        <IconTime className="h-4 w-4" />
        <span className="hidden sm:inline">Alerts</span>
        {unreadCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 origin-top-right overflow-hidden rounded-2xl border border-border bg-card shadow-pop"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-semibold">Notifications</h3>
              <button onClick={() => setAlerts(alerts.map(a => ({ ...a, read: true })))} className="text-xs text-accent hover:underline">
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn("cursor-pointer border-b border-border p-4 hover:bg-surface-2", !alert.read && "bg-accent/5")}
                  onClick={() => setAlerts(alerts.map(a => a.id === alert.id ? { ...a, read: true } : a))}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("rounded-lg p-1.5", 
                      alert.type === "warning" ? "bg-amber-500/10" : 
                      alert.type === "success" ? "bg-emerald-500/10" :
                      alert.type === "danger" ? "bg-red-500/10" : "bg-blue-500/10"
                    )}>
                      <IconBell className={cn("h-4 w-4", 
                        alert.type === "warning" ? "text-amber-500" :
                        alert.type === "success" ? "text-emerald-500" :
                        alert.type === "danger" ? "text-red-500" : "text-blue-500"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{alert.title}</p>
                        {!alert.read && <span className="h-2 w-2 rounded-full bg-accent" />}
                      </div>
                      <p className="text-xs text-muted truncate">{alert.message}</p>
                      <p className="mt-1 text-xs text-muted-2">{alert.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-3 text-center">
              <button className="text-xs text-accent hover:underline">View all notifications</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Activity Feed Component
interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

const mockActivity: Activity[] = [
  { id: "1", user: "Sarah K.", action: "created invoice", target: "#INV-892", time: "2 min ago" },
  { id: "2", user: "John M.", action: "added product", target: "Organic Tea 50g", time: "15 min ago" },
  { id: "3", user: "System", action: "completed payroll for", target: "March 2026", time: "1 hour ago" },
  { id: "4", user: "Mary W.", action: "updated customer", target: "Acme Corp", time: "2 hours ago" },
];

export function RecentActivity() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-glass">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Recent Activity</h3>
        <button className="text-xs text-accent hover:underline">View all</button>
      </div>
      <div className="space-y-4">
        {mockActivity.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
              {item.user.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-medium">{item.user}</span>{" "}
                <span className="text-muted">{item.action}</span>{" "}
                <span className="font-medium text-accent">{item.target}</span>
              </p>
              <p className="text-xs text-muted-2">{item.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Slide-over Panel Component
interface SlideOverPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function SlideOverPanel({ open, onClose, title, children, size = "md" }: SlideOverPanelProps) {
  const sizeClasses = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn("fixed right-0 top-0 z-50 h-full w-full border-l border-border bg-card shadow-pop", sizeClasses[size])}
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button onClick={onClose} className="rounded-lg p-2 hover:bg-surface-2">
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[calc(100%-4rem)] overflow-y-auto p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
