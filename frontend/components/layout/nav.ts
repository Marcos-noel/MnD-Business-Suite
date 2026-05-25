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
import { hasAnyPermission } from "@/lib/me";

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
    { href: "/dashboard", label: "Dashboard", icon: IconDashboard, module: "erp", anyPerms: ["erp.read"], colors: { a: "#E5E7EB", b: "#9CA3AF" } },
    { href: "/insights", label: "Insights", icon: IconInsights, module: "erp", anyPerms: ["erp.read"], colors: { a: "#F3F4F6", b: "#D1D5DB" } },
    { href: "/analytics", label: "Analytics", icon: IconAnalytics, module: "analytics", anyPerms: ["analytics.read"], colors: { a: "#E5E7EB", b: "#6B7280" } },
    { href: "/commerce/orders", label: "Orders", icon: IconOrders, module: "commerce", anyPerms: ["commerce.manage"], colors: { a: "#D4D4D8", b: "#71717A" } },
    { href: "/hr/me", label: "My HR", icon: IconHR, module: "hr", anyPerms: ["hr.self", "hr.manage"], colors: { a: "#F5F5F5", b: "#A3A3A3" } },
    { href: "/hr/employees", label: "HR Admin", icon: IconHR, module: "hr", anyPerms: ["hr.manage"], colors: { a: "#D4D4D8", b: "#A1A1AA" } },
    { href: "/hr/qr", label: "HR Clock QR", icon: IconHR, module: "hr", anyPerms: ["hr.manage"], colors: { a: "#E4E4E7", b: "#71717A" } },
    { href: "/hr/me/profile", label: "Settings", icon: IconHR, colors: { a: "#94A3B8", b: "#64748B" } },
    { href: "/inventory/products", label: "Inventory", icon: IconInventory, module: "inventory", anyPerms: ["inventory.read", "inventory.manage"], colors: { a: "#E5E7EB", b: "#737373" } },
    { href: "/crm/customers", label: "CRM", icon: IconCRM, module: "crm", anyPerms: ["crm.manage"], colors: { a: "#F4F4F5", b: "#A1A1AA" } },
    { href: "/finance/transactions", label: "Finance", icon: IconFinance, module: "finance", anyPerms: ["finance.manage"], colors: { a: "#E5E5E5", b: "#8A8A8A" } },
    { href: "/exports/orders", label: "Exports", icon: IconExports, module: "exports", anyPerms: ["export.manage"], colors: { a: "#FAFAFA", b: "#A3A3A3" } },
    { href: "/exports/readiness", label: "Readiness", icon: IconReadiness, module: "exports", anyPerms: ["export.manage"], colors: { a: "#E7E5E4", b: "#78716C" } },
    { href: me?.org_slug ? `/store/${me.org_slug}` : "/store/MnD", label: "Storefront", icon: IconStorefront, module: "commerce", anyPerms: ["inventory.read", "inventory.manage", "commerce.manage"], colors: { a: "#F5F5F5", b: "#A3A3A3" } },
    { href: "/assistant", label: "Assistant", icon: IconAssistant, module: "assistant", anyPerms: ["assistant.use"], colors: { a: "#E4E4E7", b: "#71717A" } },
    { href: "/admin/users", label: "Admin", icon: IconAdmin, module: "admin", anyPerms: ["users.manage"], colors: { a: "#94A3B8", b: "#64748B" } },
    { href: "/admin/rbac", label: "RBAC", icon: IconAdmin, module: "admin", anyPerms: ["rbac.manage"], colors: { a: "#94A3B8", b: "#64748B" } },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: IconAdmin, module: "admin", anyPerms: ["rbac.manage"], colors: { a: "#94A3B8", b: "#64748B" } }
  ];

  return items.filter((i) => {
    // Keep admin entries protected; expose app navigation consistently.
    if (i.href.startsWith("/admin")) return !!(i.anyPerms && hasAnyPermission(me, i.anyPerms));
    return true;
  });
}
