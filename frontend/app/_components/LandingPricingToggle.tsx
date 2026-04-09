"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/lib/locale";
import { useI18n } from "@/lib/i18n";

type Bundle = {
  name: string;
  description: string;
  monthly: number;
  highlight: string;
};

type BillingCycle = "monthly" | "yearly";

export function LandingPricingToggle({ bundles }: { bundles: Bundle[] }) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const { formatCurrency, country } = useLocale();
  const { t } = useI18n();

  // Format price compactly, showing currency symbol before amount
  const formatPrice = (monthly: number) => {
    const formatted = formatCurrency(billingCycle === "monthly" ? monthly : monthly * 10);
    // Remove unnecessary whitespace for a compact look
    return formatted.replace(/\s+/g, " ");
  };

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 pb-12 md:pb-16 sm:px-6">
      <div className="mb-8 md:mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">
            {t("bundles_offers")}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-black">
            {t("pick_bundle")}
          </h2>
        </div>
        <div className="flex items-center gap-1 md:gap-2 rounded-full bg-white border border-black/10 p-1 shadow-sm">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold transition ${
              billingCycle === "monthly"
                ? "bg-black text-white"
                : "text-black/70"
            }`}
          >
            {t("monthly")}
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold transition ${
              billingCycle === "yearly"
                ? "bg-black text-white"
                : "text-black/70"
            }`}
          >
            {t("annual")}
          </button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {bundles.map((bundle) => (
          <Card key={bundle.name} className="glass-card relative overflow-hidden p-4 md:p-6">
            <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(15,118,110,0.1),transparent_60%)]" />
            <div className="relative space-y-4 md:space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-[2px] md:space-y-[4px]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs md:text-sm font-medium text-emerald-600">KSh</span>
                    <p className="text-xl md:text-2xl font-semibold text-black leading-none">{formatPrice(bundle.monthly)}</p>
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                    {t("per_org")}/{billingCycle === "monthly" ? t("month") : t("year")}
                  </p>
                </div>
                <div className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 md:px-3 md:py-1 text-xs font-semibold text-emerald-700">
                  {bundle.highlight}
                </div>
              </div>
              <p className="text-xs md:text-sm text-black/70">{bundle.description}</p>
              <Link href="/subscription/plans">
                <Button size="sm" className="w-full">
                  {t("see_bundle")}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
