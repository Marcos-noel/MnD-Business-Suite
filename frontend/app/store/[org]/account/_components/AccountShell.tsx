"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  org: string;
  title: string;
  subtitle: string;
  active: "orders" | "profile" | "wishlist";
  actions?: ReactNode;
  children: ReactNode;
};

export function AccountShell({ org, title, subtitle, active, actions, children }: Props) {
  return (
    <div className="min-h-screen bg-[hsl(var(--c-bg))]">
      <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-10">
        <div className="page-transition space-y-6">
          <div className="rounded-3xl border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface))] p-6 shadow-[var(--shadow-1)] md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--c-muted))]">
                  Store Account
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-[hsl(var(--c-text))] md:text-3xl">
                  {title}
                </h1>
                <p className="mt-2 text-sm text-[hsl(var(--c-muted-2))]">{subtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {actions}
                <Button
                  variant="secondary"
                  onClick={() => {
                    window.location.href = `/store/${org}`;
                  }}
                >
                  Back to Store
                </Button>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={`/store/${org}/account/orders`}
                className={`nav-item ${active === "orders" ? "active" : ""}`}
              >
                Orders
              </a>
              <a
                href={`/store/${org}/account/wishlist`}
                className={`nav-item ${active === "wishlist" ? "active" : ""}`}
              >
                Wishlist
              </a>
              <a
                href={`/store/${org}/account/profile`}
                className={`nav-item ${active === "profile" ? "active" : ""}`}
              >
                Profile
              </a>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
