"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileMenuDrawer } from "@/components/layout/MobileMenuDrawer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="relative h-[100dvh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute -left-40 top-[-220px] h-[520px] w-[520px] rounded-full bg-[hsl(var(--c-accent))]/15 blur-3xl" />
        <div className="absolute -right-48 top-[-160px] h-[520px] w-[520px] rounded-full bg-[hsl(var(--c-accent-2))]/12 blur-3xl" />
      </div>

      <div className="mx-auto flex h-full max-w-[1440px] gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
        <div className="hidden lg:block">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
          <TopNav onOpenMenu={() => setMobileMenuOpen(true)} />
          <motion.main
            key="page"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0"
          >
            {children}
          </motion.main>
        </div>
      </div>

      <MobileNav />
      <MobileMenuDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </div>
  );
}
