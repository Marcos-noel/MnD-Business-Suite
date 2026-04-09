"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { CountrySelector } from "@/components/locale/CountrySelector";
import { LandingPricingToggle } from "@/app/_components/LandingPricingToggle";
import type { LandingData } from "@/lib/marketing";
import { useI18n } from "@/lib/i18n";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Boxes,
  BarChart3,
  Users,
  Brain,
  Package,
  BadgeCheck,
  Layers,
  Workflow,
  Bot,
  LineChart,
  Wallet,
  Truck,
  Store,
  HeartHandshake
} from "lucide-react";

const appIcons: Record<string, ComponentType<{ className?: string }>> = {
  HR: Users,
  CRM: HeartHandshake,
  Finance: Wallet,
  Inventory: Package,
  Commerce: Store,
  Export: Truck,
  Analytics: LineChart,
  Assistant: Bot
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, when: "beforeChildren" }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
};

const cardHover = {
  rest: { y: 0, boxShadow: "0 4px 24px -4px rgba(0,0,0,0.12)" },
  hover: { y: -4, boxShadow: "0 16px 48px 0 rgba(0,0,0,0.2)" },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
};

export function LandingClient({ landing }: { landing: LandingData }) {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useI18n();

  return (
    <div className="page-transition min-h-screen bg-gradient-to-br from-white via-[#f8f8f8] to-[#f0f0f0] scroll-smooth">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(15,118,110,0.15),transparent_70%)] blur-3xl" />
          <div className="absolute right-0 top-40 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.1),transparent_70%)] blur-3xl" />
          <div className="absolute left-0 bottom-0 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.1),transparent_70%)] blur-3xl" />
        </div>

        <header className="glass-nav fixed top-0 left-0 right-0 z-50">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Logo size="sm" />
            <div className="hidden items-center gap-4 md:flex">
              <Link href="#apps" className="text-sm font-medium text-black/70 hover:text-black">
                {t("nav_apps")}
              </Link>
              <Link href="#flows" className="text-sm font-medium text-black/70 hover:text-black">
                {t("nav_flow")}
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-black/70 hover:text-black">
                {t("nav_pricing")}
              </Link>
              <Link href="/login" className="text-sm font-medium text-black/70 hover:text-black">
                {t("nav_sign_in")}
              </Link>
              <CountrySelector />
              <Link href="/subscription/plans">
                <Button size="sm">{t("cta_get_started")}</Button>
              </Link>
            </div>
          </div>
        </header>

        <motion.section
          className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
        >
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div className="space-y-8" variants={item}>
              <div className="inline-flex items-center gap-2 rounded-full bg-black/5 backdrop-blur-md border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/60 shadow-sm">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                {landing.hero_badge}
              </div>
              <h1 className="text-3xl font-semibold leading-tight text-black sm:text-4xl md:text-5xl">
                {landing.hero_title}
              </h1>
              <p className="text-base text-black/70 sm:text-lg">{landing.hero_subtitle}</p>
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
                <Link href="/subscription/plans">
                  <Button size="lg">
                    {t("cta_start_bundle")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/store">
                  <Button size="lg" variant="secondary">
                    {t("cta_explore_storefront")}
                  </Button>
                </Link>
              </div>
               <div className="grid grid-cols-2 gap-3 rounded-3xl bg-white p-4 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.15)] md:grid-cols-4 md:p-6 border border-black/5">
                {landing.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xl font-semibold text-black md:text-2xl">{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div className="space-y-4" variants={item}>
              <Card className="glass-card relative overflow-hidden p-4 md:p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.1),transparent_60%)]" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                        Live Command Center
                      </p>
                      <p className="text-lg font-semibold text-black md:text-xl">
                        Business health in one glance
                      </p>
                    </div>
                    <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-emerald-100">
                      <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {landing.live_cards.map((item) => (
                       <div key={item.label} className="rounded-2xl bg-white p-3 border border-black/5">
                        <p className="text-xs text-black/50 md:text-sm">{item.label}</p>
                        <p className="text-base font-semibold text-black md:text-lg">{item.value}</p>
                      </div>
                    ))}
                  </div>
                   <div className="rounded-2xl bg-gradient-to-r from-black to-black/90 p-3 text-white backdrop-blur-sm border border-black/5 md:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                          AI Recommendations
                        </p>
                        <p className="text-sm font-semibold md:text-base">Reduce freight costs by 12%</p>
                      </div>
                      <Brain className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <p className="mt-1 text-xs text-white/80 md:text-sm">{landing.insight_note}</p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-4 md:p-6">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-emerald-100">
                    <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-black md:text-lg">
                      {landing.security_title}
                    </p>
                    <p className="text-sm text-black/70">
                      {landing.security_description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.section>
      </div>

      <motion.section
        id="apps"
        className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 md:pb-24"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">{t("section_suite_apps")}</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-black">
              Every team, one connected operating layer
            </h2>
          </div>
          <Link href="/subscription/plans" className="text-sm font-semibold text-emerald-600">
            Compare bundles and pricing →
          </Link>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {landing.apps.map((app, index) => {
            const Icon = appIcons[app.name] ?? Boxes;
            return (
              <motion.div key={app.name} variants={item} style={{ animationDelay: `${index * 40}ms` }}>
                <Card className="glass-card relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_80px_-24px_rgba(0,0,0,0.15)] md:p-6 md:p-8">
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.accent}`} />
                  <div className="relative space-y-3 md:space-y-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${app.color}`}>
                      <Icon className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-black">{app.name}</p>
                      <p className="text-xs md:text-sm text-black/60">{app.description}</p>
                    </div>
                    <Link href={`/apps/${app.name.toLowerCase()}`} className="text-xs md:text-sm font-medium text-black hover:underline">
                      Learn more →
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        id="flows"
        className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 md:pb-24"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div className="space-y-4 md:space-y-6" variants={item}>
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">
              {t("section_flow")}
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold text-black">
              From onboarding to apps, everything connects
            </h2>
            <p className="text-sm md:text-base text-black/70">
              MnD stitches your people, money, inventory, and customer operations into a single
              flow. No data silos, no duplicate work, just a modern suite that scales with every new
              app you enable.
            </p>
            <div className="grid gap-3 md:gap-4">
              {landing.flow_steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  className="flex items-start gap-3 rounded-2xl bg-white p-3 md:p-4 shadow-sm border border-black/5"
                  style={{ animationDelay: `${index * 60}ms` }}
                  whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                >
                  <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-black text-white">
                    <Layers className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-semibold text-black">{step.title}</p>
                    <p className="text-xs md:text-sm text-black/70">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div variants={item}>
            <Card className="glass-card relative overflow-hidden p-4 md:p-8 lg:p-10">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,118,110,0.1),rgba(0,0,0,0.02),rgba(249,115,22,0.08))]" />
              <div className="relative space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-black/50">
                      System Flow
                    </p>
                    <p className="text-lg md:text-xl font-semibold text-black">
                      One flow, multiple outputs
                    </p>
                  </div>
                  <Zap className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
                </div>
                <div className="grid gap-3 md:gap-4">
                  {landing.system_flow.map((itemText) => (
                    <div key={itemText} className="flex items-center gap-2 md:gap-3 rounded-2xl bg-white border border-black/5 p-3 md:p-4">
                      <Workflow className="h-4 w-4 md:h-5 md:w-5 text-black" />
                      <p className="text-xs md:text-sm text-black/70">{itemText}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      <LandingPricingToggle bundles={landing.bundles} />

      <motion.section
        className="mx-auto max-w-6xl px-4 pb-12 md:pb-16 sm:px-6 sm:pb-20"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.div className="grid gap-4 rounded-3xl bg-black p-4 text-white sm:p-6 md:p-8 lg:grid-cols-[1.2fr_0.8fr]" variants={item}>
          <div className="space-y-3 md:space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">{t("section_enterprise")}</p>
            <h2 className="text-xl md:text-3xl font-semibold">{landing.enterprise_title}</h2>
            <p className="text-xs md:text-sm text-white/70">{landing.enterprise_description}</p>
            <div className="flex flex-wrap gap-2">
              {landing.enterprise_badges.map((itemText) => (
                <span
                  key={itemText}
                  className="rounded-full border border-white/20 px-2 py-1 text-xs text-white/80 md:text-xs"
                >
                  {itemText}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-3 md:space-y-4">
            {landing.enterprise_cards.map((card) => (
              <div key={card.title} className="rounded-2xl bg-white/10 p-3 md:p-4">
                <p className="text-xs md:text-sm text-white/70">{card.title}</p>
                <p className="text-sm md:text-lg font-semibold">{card.description}</p>
                <p className="text-xs text-white/60">Tailored for enterprise rollouts.</p>
              </div>
            ))}
            <Link href="/contact">
              <Button size="sm" variant="secondary" className="w-full md:size-lg">
                {t("cta_talk_sales")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.section>

      <footer className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 md:pb-16">
        <div className="glass-card flex flex-col items-center gap-4 rounded-3xl p-6 text-center md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">
            {landing.footer_subtitle}
          </p>
          <h3 className="text-xl md:text-2xl font-semibold text-black">
            {landing.footer_title}
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/subscription/plans">
              <Button size="sm" className="w-full md:size-lg">
                {t("cta_view_plans")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" variant="secondary" className="w-full md:size-lg">
                {t("nav_sign_in")}
              </Button>
            </Link>
          </div>
          <p className="text-xs text-black/50">
            © 2026 MnD Business Suite. Built for ambitious teams.
          </p>
        </div>
      </footer>
    </div>
  );
}
