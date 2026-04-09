import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import DemoForm from "@/app/demo/DemoForm";
import { getLandingData } from "@/lib/marketing";
import { BadgeCheck, ArrowRight } from "lucide-react";
import { CountrySelector } from "@/components/locale/CountrySelector";

export const dynamic = "force-dynamic";

export default async function DemoPage() {
  const landing = await getLandingData();

  return (
    <div className="page-transition min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_45%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.02),transparent_70%)]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-[hsl(var(--c-text-secondary))] hover:text-[hsl(var(--c-text))]">
            ← Back to home
          </Link>
          <CountrySelector />
        </div>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--c-muted))] shadow-sm">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              Production-ready demo
            </div>
            <h1 className="text-4xl font-semibold text-[hsl(var(--c-text))] md:text-5xl">
              See MnD tailored to your workflows
            </h1>
            <p className="text-lg text-[hsl(var(--c-text-secondary))]">
              We personalize every walkthrough with your data flows, approvals, and reporting needs.
              From onboarding to AI insights, you’ll see the entire suite working together.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {landing.stats.slice(0, 4).map((stat) => (
                <Card key={stat.label} className="p-4">
                  <p className="text-2xl font-semibold text-[hsl(var(--c-text))]">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--c-muted-2))]">
                    {stat.label}
                  </p>
                </Card>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/subscription/plans">
                <Button size="lg" variant="secondary">
                  View Plans
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg">
                  Talk to Sales
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <DemoForm />
        </div>
      </div>
    </div>
  );
}
