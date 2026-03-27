"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useMe } from "@/lib/me";
import { getNavItems } from "@/components/layout/nav";

export function MobileNav() {
  const pathname = usePathname();
  const meQ = useMe();
  const items = getNavItems(meQ.data ?? null)
    .filter((i) => ["/dashboard", "/insights", "/commerce/orders", "/inventory/products", "/hr/me", "/assistant"].includes(i.href))
    .slice(0, 5);

  if (items.length === 0) return null;

  return (
    <nav className="surface noise fixed left-1/2 z-50 w-[min(680px,calc(100vw-1.5rem))] -translate-x-1/2 rounded-3xl px-2 py-2 shadow-pop lg:hidden bottom-3 [padding-bottom:calc(0.5rem+env(safe-area-inset-bottom))]">
      <div className={cn("grid", items.length === 5 ? "grid-cols-5" : "grid-cols-4")}>
        {items.map((i) => {
          const active = pathname === i.href || pathname.startsWith(i.href + "/");
          const Icon = i.icon;
          return (
            <Link
              key={i.href}
              href={i.href as any}
              style={{ ["--app-a" as any]: i.colors.a, ["--app-b" as any]: i.colors.b } as any}
              data-active={active}
              prefetch
              className={cn(
                "app-sheen app-active-glow flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs transition",
                active
                  ? "bg-[color-mix(in_oklab,hsl(var(--c-surface))_80%,transparent)] text-[hsl(var(--c-text))]"
                  : "text-[hsl(var(--c-muted))] hover:bg-[color-mix(in_oklab,hsl(var(--c-surface))_65%,transparent)] hover:text-[hsl(var(--c-text))]"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="leading-none">{i.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
