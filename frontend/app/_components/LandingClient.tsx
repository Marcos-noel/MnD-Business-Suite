"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { CountrySelector } from "@/components/locale/CountrySelector";
import { LandingPricingToggle } from "@/app/_components/LandingPricingToggle";
import { HeroCarousel } from "@/components/marketing/HeroCarousel";
import type { LandingData } from "@/lib/marketing";
import { useI18n } from "@/lib/i18n";
import {
  House,
  ShieldCheck,
  Zap,
  Boxes,
  Layers,
  Workflow,
  Bot,
  LineChart,
  Wallet,
  Truck,
  Store,
  HeartHandshake,
  Users,
  Package,
  BadgeCheck,
  Sparkles,
  CheckCircle2,
  Building2,
  Clock3,
  MoveRight,
  Tags,
  LogIn,
} from "lucide-react";

const appIcons: Record<string, ComponentType<{ className?: string }>> = {
  HR: Users,
  CRM: HeartHandshake,
  Finance: Wallet,
  Inventory: Package,
  Commerce: Store,
  Export: Truck,
  Analytics: LineChart,
  Assistant: Bot,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, when: "beforeChildren" },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const trustPills = [
  { label: "Unified Workspace", icon: Building2 },
  { label: "Fast Deployment", icon: Clock3 },
  { label: "Enterprise Security", icon: ShieldCheck },
];

const proofItems = [
  { label: "Operational Uptime", value: "99.9%" },
  { label: "Avg. Workflow Speedup", value: "3.2x" },
  { label: "Audit-ready Controls", value: "SOC-aligned" },
  { label: "Teams Onboarded", value: "10k+" },
];

const personaCopy = {
  ceo: "Gain one live control panel for growth, costs, and execution across every team.",
  ops: "Standardize workflows from onboarding to fulfillment with fewer handoffs.",
  finance: "Unify billing, transactions, and reporting with clean, auditable records.",
  hr: "Centralize people operations, approvals, and workforce visibility in one secure system.",
} as const;

export function LandingClient({ landing }: { landing: LandingData }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [persona, setPersona] = useState<keyof typeof personaCopy>("ceo");
  const [activeApp, setActiveApp] = useState(landing.apps[0]?.name ?? "HR");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  return (
    <div className="page-transition min-h-screen bg-white pb-24 text-black scroll-smooth md:pb-0">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-white" />
        <div className="pointer-events-none absolute -left-28 top-20 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.09),transparent_68%)] blur-2xl" />
        <div className="pointer-events-none absolute -right-20 top-[22rem] -z-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(88,140,255,0.22),transparent_70%)] blur-2xl" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,1),rgba(246,248,252,0.8)_32%,rgba(255,255,255,1)_70%)]" />

        <header className="fixed left-0 right-0 top-0 z-50 border-b border-black bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
            <Logo size="sm" />
            <div className="hidden items-center gap-4 md:flex">
              <Link href="#apps" className="text-sm font-medium text-black">{t("nav_apps")}</Link>
              <Link href="#flows" className="text-sm font-medium text-black">{t("nav_flow")}</Link>
              <Link href="#pricing" className="text-sm font-medium text-black">{t("nav_pricing")}</Link>
              <Link href="/login" className="text-sm font-medium text-black">{t("nav_sign_in")}</Link>
              <CountrySelector />
              <Link href="/subscription/plans"><Button size="sm">{t("cta_get_started")}</Button></Link>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <Link href="/login"><Button size="sm" variant="secondary">Sign In</Button></Link>
              <Link href="/subscription/plans"><Button size="sm">Start</Button></Link>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-3 pb-5 pt-20 sm:px-6 sm:pb-8 sm:pt-24">
          <HeroCarousel />
        </section>

        <motion.section
          className="mx-auto grid max-w-6xl gap-6 px-3 pb-12 sm:gap-10 sm:px-6 sm:pb-20 lg:grid-cols-[1.05fr_0.95fr]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
        >
          <motion.div className="space-y-5 sm:space-y-8" variants={item}>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/70 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.2em]">
              <BadgeCheck className="h-4 w-4 text-black" />
              {landing.hero_badge}
            </div>
            <h1 className="text-[2.05rem] font-semibold leading-[1.05] text-black sm:text-4xl md:text-5xl">{landing.hero_title}</h1>
            <p className="text-[15px] text-black/75 sm:text-lg">{landing.hero_subtitle}</p>
            <div className="rounded-2xl border border-black/10 bg-white/85 p-3 backdrop-blur-sm sm:p-4">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {Object.keys(personaCopy).map((key) => (
                  <button
                    key={key}
                    onClick={() => setPersona(key as keyof typeof personaCopy)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                      persona === key ? "bg-black text-white" : "bg-black/[0.04] text-black/60 hover:bg-black/[0.08]"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
              <p className="text-sm text-black/75">{personaCopy[persona]}</p>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-row sm:gap-4">
              <Link href="/subscription/plans"><Button size="lg" className="w-full justify-center">{t("cta_start_bundle")}<MoveRight className="h-4 w-4" /></Button></Link>
              <Link href="/store/MnD"><Button size="lg" variant="secondary" className="w-full justify-center">{t("cta_explore_storefront")}</Button></Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {trustPills.map((pill) => {
                const Icon = pill.icon;
                return (
                  <div key={pill.label} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-black/70">
                    <Icon className="h-3.5 w-3.5 text-black/80" />
                    {pill.label}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2.5 rounded-3xl border border-black/10 bg-white p-3 shadow-[0_24px_90px_-36px_rgba(0,0,0,0.18)] sm:gap-3 sm:p-4 md:grid-cols-4 md:p-6">
              {landing.stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-lg font-semibold text-black md:text-2xl">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-black/55 sm:text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="space-y-4 lg:space-y-5" variants={item}>
            <Card className="border border-black/10 bg-white p-4 md:p-6">
              <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/55">Security</p>
                  <p className="mt-2 text-sm font-medium text-black">{landing.security_title}</p>
                  <p className="mt-1 text-xs text-black/70">{landing.security_description}</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/55">Automation</p>
                  <p className="mt-2 text-sm font-medium text-black">Cross-app workflows</p>
                  <p className="mt-1 text-xs text-black/70">Tasks, alerts, and approvals connected across departments.</p>
                </div>
              </div>
            </Card>

            <Card className="border border-black/10 bg-white p-4 md:p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-black/55">Platform Snapshot</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {landing.stats.map((stat) => (
                  <div key={`side-${stat.label}`} className="rounded-2xl border border-black/10 bg-black/[0.02] p-3">
                    <p className="text-lg font-semibold text-black">{stat.value}</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-black/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.section>
      </div>

      <motion.section
        id="apps"
        className="mx-auto max-w-6xl px-3 pb-12 sm:px-6 sm:pb-20 md:pb-24"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="mb-6 flex flex-col gap-2 sm:mb-10 sm:gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/55">{t("section_suite_apps")}</p>
            <h2 className="text-2xl font-semibold text-black md:text-3xl">Every team, one connected operating layer</h2>
          </div>
          <Link href="/subscription/plans" className="inline-flex items-center gap-2 text-sm font-semibold text-black">
            Compare bundles and pricing
            <MoveRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border border-black/10 bg-white p-4 md:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-black/55">Ecosystem Map</p>
            <p className="mt-2 text-sm text-black/70">Hover modules to preview how teams, finance, inventory, and customer operations connect.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {landing.apps.map((app) => {
                const Icon = appIcons[app.name] ?? Boxes;
                const active = activeApp === app.name;
                return (
                  <button
                    key={`map-${app.name}`}
                    onMouseEnter={() => setActiveApp(app.name)}
                    onFocus={() => setActiveApp(app.name)}
                    className={`rounded-2xl border p-3 text-left transition ${
                      active ? "border-black bg-black text-white shadow-[0_18px_40px_-25px_rgba(0,0,0,0.65)]" : "border-black/10 bg-white hover:border-black/35"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-white" : "text-black/75"}`} />
                    <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.16em] ${active ? "text-white" : "text-black/80"}`}>{app.name}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 rounded-2xl border border-black/10 bg-black/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-black/55">Active module</p>
              <p className="mt-1 text-base font-semibold text-black">{activeApp}</p>
              <p className="mt-1 text-sm text-black/70">{landing.apps.find((app) => app.name === activeApp)?.description}</p>
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          {landing.apps.map((app, index) => {
            const Icon = appIcons[app.name] ?? Boxes;
            return (
              <motion.div key={app.name} variants={item} style={{ animationDelay: `${index * 40}ms` }}>
                <Card className="group relative overflow-hidden rounded-3xl border border-black bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-black hover:text-white hover:shadow-[0_32px_90px_-28px_rgba(0,0,0,0.35)] md:p-6 md:p-8">
                  <div className="absolute inset-0 bg-transparent" />
                  <div className="relative space-y-3 md:space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-black bg-white transition group-hover:border-white group-hover:bg-black">
                      <Icon className="h-5 w-5 text-black group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-black group-hover:text-white">{app.name}</p>
                      <p className="text-xs text-black md:text-sm group-hover:text-white">{app.description}</p>
                    </div>
                    <Link href={`/apps/${app.name.toLowerCase()}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-black transition md:text-sm group-hover:text-white">
                      Learn more
                      <MoveRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
          </div>
        </div>
      </motion.section>

      <section className="mx-auto max-w-6xl px-3 pb-12 sm:px-6 sm:pb-20">
        <div className="rounded-[2rem] border border-black/10 bg-white p-4 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.25)] sm:p-6 md:p-8">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/55">Proof of Performance</p>
              <h3 className="text-xl font-semibold text-black md:text-2xl">Built for high-trust execution at scale</h3>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-black/55">Live operational benchmarks</span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {proofItems.map((itemProof) => (
              <div key={itemProof.label} className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                <p className="text-xl font-semibold text-black">{itemProof.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-black/65">{itemProof.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <motion.section
        id="flows"
        className="mx-auto max-w-6xl px-3 pb-12 sm:px-6 sm:pb-20 md:pb-24"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div className="space-y-4 md:space-y-6" variants={item}>
            <p className="text-xs uppercase tracking-[0.2em] text-black/55">{t("section_flow")}</p>
            <h2 className="text-2xl font-semibold text-black md:text-3xl">From onboarding to apps, everything connects</h2>
            <p className="text-sm text-black/70 md:text-base">MnD stitches your people, money, inventory, and customer operations into a single flow.</p>
            <div className="grid gap-3 md:gap-4">
              {landing.flow_steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-3 md:p-4"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white md:h-10 md:w-10">
                    <Layers className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black md:text-base">{step.title}</p>
                    <p className="text-xs text-black/70 md:text-sm">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div variants={item}>
            <Card className="relative overflow-hidden border border-black/10 bg-white p-4 md:p-8 lg:p-10">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.04),rgba(255,255,255,0.02),rgba(88,140,255,0.12))]" />
              <div className="relative space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-black/55">System Flow</p>
                    <p className="text-lg font-semibold text-black md:text-xl">One flow, multiple outputs</p>
                  </div>
                  <Zap className="h-5 w-5 text-black md:h-6 md:w-6" />
                </div>
                <div className="grid gap-3 md:gap-4">
                  {landing.system_flow.map((itemText) => (
                    <div key={itemText} className="flex items-center gap-2 rounded-2xl border border-black/10 bg-black/[0.03] p-3 md:gap-3 md:p-4">
                      <Workflow className="h-4 w-4 text-black md:h-5 md:w-5" />
                      <p className="text-xs text-black/75 md:text-sm">{itemText}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      <section className="mx-auto max-w-6xl px-3 pb-12 sm:px-6 sm:pb-16">
        <div className="rounded-[2rem] bg-black p-4 text-white sm:p-6 md:p-8">
          <div className="grid gap-3 sm:gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-black bg-black px-5 py-6">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/5">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <p className="mt-5 text-[1.08rem] font-semibold tracking-tight">AI-assisted execution</p>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-white/78">Suggestions and actions where teams already work.</p>
            </div>
            <div className="rounded-2xl border border-black bg-black px-5 py-6">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/5">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <p className="mt-5 text-[1.08rem] font-semibold tracking-tight">Standardized operations</p>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-white/78">Reusable workflows across sales, finance, HR, and logistics.</p>
            </div>
            <div className="rounded-2xl border border-black bg-black px-5 py-6">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/5">
                <Workflow className="h-4 w-4 text-white" />
              </div>
              <p className="mt-5 text-[1.08rem] font-semibold tracking-tight">Connected data model</p>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-white/78">Single source of truth from order creation to fulfillment.</p>
            </div>
          </div>
        </div>
      </section>

      <LandingPricingToggle bundles={landing.bundles} />

      <motion.section className="mx-auto max-w-6xl px-3 pb-10 sm:px-6 sm:pb-20 md:pb-16" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
        <motion.div className="grid gap-4 rounded-3xl border border-black/15 bg-black p-4 text-white shadow-[0_30px_100px_-40px_rgba(0,0,0,1)] sm:p-6 md:p-8 lg:grid-cols-[1.2fr_0.8fr]" variants={item}>
          <div className="space-y-3 md:space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">{t("section_enterprise")}</p>
            <h2 className="text-xl font-semibold md:text-3xl">{landing.enterprise_title}</h2>
            <p className="text-xs text-white/70 md:text-sm">{landing.enterprise_description}</p>
            <div className="flex flex-wrap gap-2">
              {landing.enterprise_badges.map((pill) => (
                <span key={pill} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80">{pill}</span>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {landing.enterprise_cards.map((card) => (
              <div key={card.title} className="rounded-2xl bg-black p-3">
                <p className="text-xs text-white/70">{card.title}</p>
                <p className="text-sm font-semibold">{card.description}</p>
              </div>
            ))}
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/contact"><Button size="sm" variant="secondary" className="w-full">{t("cta_talk_sales")}</Button></Link>
              <Link href="/demo"><Button size="sm" variant="ghost" className="w-full border border-white/30 text-white">Book Demo</Button></Link>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <footer className="mx-auto max-w-6xl px-3 pb-10 sm:px-6 md:pb-16">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-black/10 bg-white p-6 text-center md:flex-row md:text-left">
          <div>
            <p className="text-sm font-semibold text-black">{landing.footer_title}</p>
            <p className="text-xs text-black/60">{landing.footer_subtitle}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/subscription/plans"><Button size="sm">{t("cta_view_plans")}</Button></Link>
            <Link href="/login"><Button size="sm" variant="secondary">{t("nav_sign_in")}</Button></Link>
          </div>
        </div>
      </footer>

      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-1rem)] max-w-sm -translate-x-1/2 items-center justify-between rounded-2xl border border-black bg-white p-1.5 shadow-[0_16px_42px_-20px_rgba(0,0,0,0.45)] md:hidden">
        <Link href="/" className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium ${pathname === "/" && !hash ? "bg-black text-white" : "text-black/75"}`}>
          <House className="h-4 w-4" />
          <span>Home</span>
        </Link>
        <Link href="#apps" className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium ${hash === "#apps" ? "bg-black text-white" : "text-black/75"}`}>
          <Boxes className="h-4 w-4" />
          <span>Apps</span>
        </Link>
        <Link href="#pricing" className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium ${hash === "#pricing" ? "bg-black text-white" : "text-black/75"}`}>
          <Tags className="h-4 w-4" />
          <span>Pricing</span>
        </Link>
        <Link href="/login" className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium ${pathname.startsWith("/login") ? "bg-black text-white" : "text-black/75"}`}>
          <LogIn className="h-4 w-4" />
          <span>Login</span>
        </Link>
      </nav>
    </div>
  );
}
