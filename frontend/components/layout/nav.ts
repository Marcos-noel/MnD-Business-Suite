"use client";

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
  IconStorefront
} from "@/components/icons/AppIcons";
import type { Me } from "@/lib/me";
import { hasAnyPermission, hasModule } from "@/lib/me";

export type NavItem = {
  href: string;
  label: string;
  icon: any;
  module?: string;
  anyPerms?: string[];
  colors: { a: string; b: string };
};

export function getNavItems(me: Me | null): NavItem[] {
  const items: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: IconDashboard, module: "erp", anyPerms: ["erp.read"], colors: { a: "#6366F1", b: "#22D3EE" } },
    { href: "/insights", label: "Insights", icon: IconInsights, module: "erp", anyPerms: ["erp.read"], colors: { a: "#06B6D4", b: "#6366F1" } },
    { href: "/analytics", label: "Analytics", icon: IconAnalytics, module: "analytics", anyPerms: ["analytics.read"], colors: { a: "#0EA5E9", b: "#6366F1" } },
    { href: "/commerce/orders", label: "Orders", icon: IconOrders, module: "commerce", anyPerms: ["commerce.manage"], colors: { a: "#F97316", b: "#F43F5E" } },
    { href: "/hr/me", label: "My HR", icon: IconHR, module: "hr", anyPerms: ["hr.self", "hr.manage"], colors: { a: "#22C55E", b: "#14B8A6" } },
    { href: "/hr/employees", label: "HR Admin", icon: IconHR, module: "hr", anyPerms: ["hr.manage"], colors: { a: "#22C55E", b: "#14B8A6" } },
    { href: "/hr/qr", label: "HR Clock QR", icon: IconHR, module: "hr", anyPerms: ["hr.manage"], colors: { a: "#10B981", b: "#22C55E" } },
    { href: "/hr/me/profile", label: "Settings", icon: IconHR, colors: { a: "#94A3B8", b: "#64748B" } },
    { href: "/inventory/products", label: "Inventory", icon: IconInventory, module: "inventory", anyPerms: ["inventory.read", "inventory.manage"], colors: { a: "#F59E0B", b: "#10B981" } },
    { href: "/crm/customers", label: "CRM", icon: IconCRM, module: "crm", anyPerms: ["crm.manage"], colors: { a: "#A855F7", b: "#EC4899" } },
    { href: "/finance/transactions", label: "Finance", icon: IconFinance, module: "finance", anyPerms: ["finance.manage"], colors: { a: "#38BDF8", b: "#0EA5E9" } },
    { href: "/exports/orders", label: "Exports", icon: IconExports, module: "exports", anyPerms: ["export.manage"], colors: { a: "#60A5FA", b: "#A78BFA" } },
    { href: "/exports/readiness", label: "Readiness", icon: IconReadiness, module: "exports", anyPerms: ["export.manage"], colors: { a: "#F472B6", b: "#A78BFA" } },
    { href: me?.org_slug ? `/store/${me.org_slug}` : "/store", label: "Storefront", icon: IconStorefront, module: "commerce", anyPerms: ["inventory.read", "inventory.manage", "commerce.manage"], colors: { a: "#22D3EE", b: "#6366F1" } },
    { href: "/assistant", label: "Assistant", icon: IconAssistant, module: "assistant", anyPerms: ["assistant.use"], colors: { a: "#22D3EE", b: "#A855F7" } },
    { href: "/admin/users", label: "Admin", icon: IconAdmin, module: "admin", anyPerms: ["users.manage"], colors: { a: "#94A3B8", b: "#64748B" } },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: IconAdmin, module: "admin", anyPerms: ["rbac.manage"], colors: { a: "#94A3B8", b: "#64748B" } }
  ];

  return items.filter((i) => {
    // Always show Dashboard and Settings
    if (i.href === "/dashboard" || i.href === "/hr/me/profile") return true;
    if (i.module && !hasModule(me, i.module)) return false;
    if (i.anyPerms && !hasAnyPermission(me, i.anyPerms)) return false;
    return true;
  });
}
