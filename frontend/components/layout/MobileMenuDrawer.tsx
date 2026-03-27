"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Moon, Sun, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { useMe } from "@/lib/me";
import { getNavItems } from "@/components/layout/nav";
import { useTheme } from "@/lib/theme";

export function MobileMenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const meQ = useMe();
  const { theme, toggle } = useTheme();
  const items = getNavItems(meQ.data ?? null);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/35" onClick={onClose} role="button" aria-label="Close menu" />
          <motion.div
            initial={{ x: -18, opacity: 0, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -10, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute left-3 top-3 w-[min(420px,calc(100vw-1.5rem))]"
          >
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{meQ.data?.org_name ?? "MnD OS"}</div>
                  <div className="mt-0.5 text-xs text-[hsl(var(--c-muted-2))]">{meQ.data?.full_name ?? ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  <IconButton onClick={toggle} aria-label="Toggle theme" size="sm">
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </IconButton>
                  <IconButton onClick={onClose} aria-label="Close menu" size="sm">
                    <X className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                {items.map((i) => {
                  const Icon = i.icon;
                  return (
                    <Link
                      key={i.href}
                      href={i.href as any}
                      onClick={onClose}
                      style={{ ["--app-a" as any]: i.colors.a, ["--app-b" as any]: i.colors.b } as any}
                      className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--c-border))] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--app-a)_10%,transparent),color-mix(in_oklab,var(--app-b)_10%,transparent))] px-3 py-2 text-sm text-[hsl(var(--c-text))]"
                    >
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[hsl(var(--c-border))] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--app-a)_26%,transparent),color-mix(in_oklab,var(--app-b)_26%,transparent))]"
                        style={{ ["--app-a" as any]: i.colors.a, ["--app-b" as any]: i.colors.b } as any}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-medium">{i.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="ghost" onClick={logout}>
                  Logout
                </Button>
                <Button variant="secondary" onClick={onClose}>
                  Close
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
