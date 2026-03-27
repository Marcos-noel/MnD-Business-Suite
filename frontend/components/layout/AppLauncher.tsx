"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  X,
} from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { hasAnyPermission, hasModule, type Me } from "@/lib/me";
import { Portal } from "@/components/ui/Portal";
import {
  IconAdmin,
  IconAnalytics,
  IconAssistant,
  IconCRM,
  IconDashboard,
  IconInsights,
  IconExports,
  IconFinance,
  IconHR,
  IconInventory,
  IconOrders,
  IconReadiness,
  IconStorefront,
  IconSystem
} from "@/components/icons/AppIcons";

type AppItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  anyPerms: string[];
  module?: string;
  colors: { a: string; b: string };
};

const APPS: AppItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Company overview and KPIs",
    href: "/dashboard",
    icon: IconDashboard,
    anyPerms: ["erp.read"],
    module: "erp",
    colors: { a: "#6366F1", b: "#22D3EE" }
  },
  {
    id: "insights",
    label: "Insights",
    description: "KPIs and charts across apps",
    href: "/insights",
    icon: IconInsights,
    anyPerms: ["erp.read"],
    module: "erp",
    colors: { a: "#06B6D4", b: "#6366F1" }
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Signals, charts, and reports",
    href: "/analytics",
    icon: IconAnalytics,
    anyPerms: ["analytics.read"],
    module: "analytics",
    colors: { a: "#0EA5E9", b: "#6366F1" }
  },
  {
    id: "commerce",
    label: "Orders",
    description: "Sales orders and payments",
    href: "/commerce/orders",
    icon: IconOrders,
    anyPerms: ["commerce.manage"],
    module: "commerce",
    colors: { a: "#F97316", b: "#F43F5E" }
  },
  {
    id: "hr",
    label: "HR",
    description: "Employees, attendance, leave",
    href: "/hr/me",
    icon: IconHR,
    anyPerms: ["hr.self", "hr.manage"],
    module: "hr",
    colors: { a: "#22C55E", b: "#14B8A6" }
  },
  {
    id: "hr_qr",
    label: "HR Clock QR",
    description: "Office QR for clock-in/out",
    href: "/hr/qr",
    icon: IconHR,
    anyPerms: ["hr.manage"],
    module: "hr",
    colors: { a: "#10B981", b: "#22C55E" }
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Products, suppliers, stock",
    href: "/inventory/products",
    icon: IconInventory,
    anyPerms: ["inventory.read", "inventory.manage"],
    module: "inventory",
    colors: { a: "#F59E0B", b: "#10B981" }
  },
  {
    id: "crm",
    label: "CRM",
    description: "Customers and pipelines",
    href: "/crm/customers",
    icon: IconCRM,
    anyPerms: ["crm.manage"],
    module: "crm",
    colors: { a: "#A855F7", b: "#EC4899" }
  },
  {
    id: "finance",
    label: "Finance",
    description: "Transactions and profit",
    href: "/finance/transactions",
    icon: IconFinance,
    anyPerms: ["finance.manage"],
    module: "finance",
    colors: { a: "#38BDF8", b: "#0EA5E9" }
  },
  {
    id: "exports",
    label: "Exports",
    description: "Orders, shipments, documents",
    href: "/exports/orders",
    icon: IconExports,
    anyPerms: ["export.manage"],
    module: "exports",
    colors: { a: "#60A5FA", b: "#A78BFA" }
  },
  {
    id: "readiness",
    label: "Readiness",
    description: "Compliance and checklists",
    href: "/exports/readiness",
    icon: IconReadiness,
    anyPerms: ["export.manage"],
    module: "exports",
    colors: { a: "#F472B6", b: "#A78BFA" }
  },
  {
    id: "storefront",
    label: "Storefront",
    description: "Public catalog (demo)",
    href: "/store/demo",
    icon: IconStorefront,
    anyPerms: ["inventory.read", "inventory.manage", "commerce.manage"],
    module: "commerce",
    colors: { a: "#22D3EE", b: "#6366F1" }
  },
  {
    id: "assistant",
    label: "Assistant",
    description: "AI ops copilot",
    href: "/assistant",
    icon: IconAssistant,
    anyPerms: ["assistant.use"],
    module: "assistant",
    colors: { a: "#22D3EE", b: "#A855F7" }
  },
  {
    id: "admin",
    label: "Admin",
    description: "Users and access control",
    href: "/admin/users",
    icon: IconAdmin,
    anyPerms: ["users.manage", "rbac.manage"],
    module: "admin",
    colors: { a: "#94A3B8", b: "#64748B" }
  },
  {
    id: "health",
    label: "System",
    description: "Ops diagnostics",
    href: "/dashboard",
    icon: IconSystem,
    anyPerms: ["erp.read"],
    module: "erp",
    colors: { a: "#94A3B8", b: "#64748B" }
  }
];

export function AppLauncher({ me }: { me: Me | null }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const apps = useMemo(() => {
    const allowed = APPS.filter((a) => hasAnyPermission(me, a.anyPerms) && (!a.module || hasModule(me, a.module)));
    if (!q.trim()) return allowed;
    const needle = q.trim().toLowerCase();
    return allowed.filter((a) => (a.label + " " + a.description).toLowerCase().includes(needle));
  }, [me, q]);

  return (
    <>
      <IconButton onClick={() => setOpen(true)} aria-label="Open app launcher" size="sm">
        <LayoutGrid className="h-4 w-4" />
      </IconButton>

      <Portal>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000]">
              <div className="absolute inset-0 bg-black/35" onClick={() => setOpen(false)} role="button" aria-label="Close launcher" />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.99 }}
                transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
                className="absolute left-1/2 top-[76px] w-[min(920px,calc(100vw-2rem))] -translate-x-1/2"
              >
                <Card className="flex max-h-[calc(100vh-6.5rem)] flex-col overflow-hidden p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold tracking-tight">Apps</div>
                    <div className="text-xs text-[hsl(var(--c-muted-2))]">{me?.org_id ? `Org: ${me.org_id}` : ""}</div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Input placeholder="Search apps..." value={q} onChange={(e) => setQ(e.target.value)} />
                    <IconButton onClick={() => setOpen(false)} aria-label="Close launcher" size="sm">
                      <X className="h-4 w-4" />
                    </IconButton>
                  </div>

                  <div className="mt-4 min-h-0 overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {apps.map((a) => {
                        const Icon = a.icon;
                        const active = pathname === a.href || pathname.startsWith(a.href + "/");
                        return (
                          <Link
                            key={a.id}
                            href={a.href as any}
                            onClick={() => setOpen(false)}
                            style={{ ["--app-a" as any]: a.colors.a, ["--app-b" as any]: a.colors.b } as any}
                            data-active={active}
                            prefetch
                            onMouseEnter={() => router.prefetch(a.href as any)}
                            className={cn(
                              "group app-sheen app-active-glow rounded-2xl p-4 transition duration-200 ease-ease-out",
                              "hairline bg-[linear-gradient(135deg,color-mix(in_oklab,var(--app-a)_8%,transparent),color-mix(in_oklab,var(--app-b)_8%,transparent))] hover:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--app-a)_12%,transparent),color-mix(in_oklab,var(--app-b)_12%,transparent))]"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsl(var(--c-border))] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--app-a)_26%,transparent),color-mix(in_oklab,var(--app-b)_26%,transparent))]">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold tracking-tight">{a.label}</div>
                                <div className="mt-1 text-xs text-[hsl(var(--c-muted-2))]">{a.description}</div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                      {apps.length === 0 && (
                        <div className="col-span-full rounded-2xl border border-dashed border-[hsl(var(--c-border))] p-6 text-sm text-[hsl(var(--c-muted-2))]">
                          No apps available for your role.
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
