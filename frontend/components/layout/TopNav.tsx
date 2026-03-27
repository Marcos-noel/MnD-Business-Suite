"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Moon, PanelLeftOpen, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { useTheme } from "@/lib/theme";
import { AppLauncher } from "@/components/layout/AppLauncher";
import { useMe } from "@/lib/me";

export function TopNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const meQ = useMe();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="surface noise flex items-center justify-between gap-4 rounded-2xl px-4 py-3 shadow-glass">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {onOpenMenu && (
          <div className="lg:hidden">
            <IconButton onClick={onOpenMenu} aria-label="Open menu" size="sm">
              <PanelLeftOpen className="h-4 w-4" />
            </IconButton>
          </div>
        )}
        <Link
          href="/dashboard"
          className="hairline flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[color-mix(in_oklab,hsl(var(--c-surface))_70%,transparent)]"
          aria-label="Home"
          prefetch
        >
          <img src="/brand/mnd-symbol.svg" alt="MnD" className="h-7 w-7" />
        </Link>
        <AppLauncher me={meQ.data ?? null} />
        <Search className="h-4 w-4 text-[hsl(var(--c-muted-2))]" />
        <Input
          placeholder="Search (customers, products, orders...)"
          className="hidden h-10 min-w-0 bg-white/0 md:block"
        />
      </div>
      <div className="flex items-center gap-2">
        {meQ.data?.full_name && (
          <div className="hidden text-sm text-[hsl(var(--c-muted-2))] md:block">{meQ.data.full_name}</div>
        )}
        <IconButton onClick={toggle} aria-label="Toggle theme" size="sm">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </IconButton>
        <Button variant="ghost" onClick={logout} size="sm">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
