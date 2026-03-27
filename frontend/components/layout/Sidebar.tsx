"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/IconButton";
import { useMe } from "@/lib/me";
import { getNavItems } from "@/components/layout/nav";
import { Input } from "@/components/ui/Input";
import { IconBell, IconProfile } from "@/components/icons/AppIcons";

export function Sidebar({
  collapsed,
  onToggle
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const meQ = useMe();
  const [q, setQ] = useState("");
  
  const nav = useMemo(() => {
    const items = getNavItems(meQ.data ?? null);
    if (!q.trim()) return items;
    const needle = q.trim().toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(needle) || i.href.toLowerCase().includes(needle));
  }, [meQ.data, q]);
  
  const primary = nav.filter((i) => !i.href.startsWith("/admin"));
  const admin = nav.filter((i) => i.href.startsWith("/admin"));
  
  const initials = useMemo(() => {
    const name = meQ.data?.full_name?.trim();
    if (!name) return "U";
    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
  }, [meQ.data?.full_name]);

  const orgInitial = useMemo(() => {
    const name = meQ.data?.org_name?.trim();
    if (!name) return "M";
    return name[0]?.toUpperCase() || "M";
  }, [meQ.data?.org_name]);

  const displayInitial = useMemo(() => {
    // Show user initial if user has avatar, otherwise show org initial
    if (meQ.data?.avatar_url) {
      const name = meQ.data?.full_name?.trim();
      if (!name) return null;
      const parts = name.split(/\s+/).slice(0, 2);
      return parts.map((p) => p[0]?.toUpperCase()).join("") || null;
    }
    return orgInitial;
  }, [meQ.data?.avatar_url, meQ.data?.full_name, orgInitial]);

  return (
    <aside
      className={cn(
        "sticky top-4 h-[calc(100vh-2rem)] overflow-hidden rounded-lg border bg-card p-2 shadow-elevate",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2 min-w-0">
            {meQ.data?.org_logo_url ? (
              <img 
                src={meQ.data.org_logo_url} 
                alt="Organization Logo" 
                className="h-10 w-10 rounded-md object-cover"
              />
            ) : meQ.data?.avatar_url ? (
              <img 
                src={meQ.data.avatar_url} 
                alt="Avatar" 
                className="h-10 w-10 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent">
                <span className="text-sm font-semibold text-white">{orgInitial}</span>
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm font-semibold">{meQ.data?.org_name ?? "MnD OS"}</div>
                <div className="truncate text-xs text-muted">
                  {meQ.data?.full_name ? meQ.data.full_name : "Operations"}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!collapsed && (
              <IconButton aria-label="Notifications" size="sm">
                <IconBell className="h-4 w-4" />
              </IconButton>
            )}
            <IconButton onClick={onToggle} aria-label="Toggle sidebar" size="sm">
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </IconButton>
          </div>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="mt-2 px-2">
            <Input 
              placeholder="Search apps..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              className="h-8 bg-surface-2"
            />
          </div>
        )}

        {/* Apps Section */}
        <div className={cn("mt-3 px-2 text-xs font-semibold uppercase text-muted", collapsed && "sr-only")}>
          Apps
        </div>

        {/* Navigation */}
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin py-1 pr-1">
          <nav className="space-y-0.5">
            {primary.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  prefetch
                  className={cn(
                    "nav-item",
                    active && "active",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Admin Section */}
          {admin.length > 0 && (
            <>
              <div className={cn("mt-4 px-2 text-xs font-semibold uppercase text-muted", collapsed && "sr-only")}>
                Admin
              </div>
              <nav className="mt-1 space-y-0.5">
                {admin.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href as any}
                      prefetch
                      className={cn(
                        "nav-item",
                        active && "active",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        {/* User Profile */}
        {!collapsed && (
          <div className="mt-2 border-t pt-2">
            <div className="flex items-center gap-2 rounded-md p-2 hover:bg-surface-2">
              {meQ.data?.avatar_url ? (
                <img 
                  src={meQ.data.avatar_url} 
                  alt="User Avatar" 
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-sm font-medium">{meQ.data?.full_name ?? "User"}</div>
                <div className="truncate text-xs text-muted">{meQ.data?.email ?? ""}</div>
              </div>
              <IconButton aria-label="Profile" size="sm">
                <IconProfile className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
