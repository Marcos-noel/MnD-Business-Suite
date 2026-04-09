import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Users,
  HeartHandshake,
  Wallet,
  Package,
  Store,
  Truck,
  LineChart,
  Bot,
  ArrowLeft,
  Check,
  Sparkles
} from "lucide-react";
import type { ComponentType } from "react";

const apps: Record<string, {
  name: string;
  description: string;
  tagline: string;
  features: string[];
  benefits: string[];
  icon: ComponentType<{ className?: string }>;
  color: string;
  route: string;
}> = {
  hr: {
    name: "HR",
    description: "Complete human resource management for your team. From onboarding to payroll, attendance to performance reviews.",
    tagline: "People operations, simplified",
    features: [
      "Employee onboarding & offboarding",
      "Attendance & time tracking",
      "Leave management",
      "Performance reviews",
      "Document management",
      "Org chart visualization"
    ],
    benefits: [
      "Reduce onboarding time by 70%",
      "Automated compliance reminders",
      "Self-service employee portal",
      "Real-time headcount insights"
    ],
    icon: Users,
    color: "from-amber-300/30 to-orange-500/20",
    route: "/hr/employees"
  },
  crm: {
    name: "CRM",
    description: "Customer relationship management that actually works. Pipeline tracking, deal management, and intelligent follow-ups.",
    tagline: "Every relationship, tracked",
    features: [
      "Pipeline management",
      "Contact management",
      "Deal tracking",
      "Task & activity reminders",
      "Email integration",
      "Sales forecasting"
    ],
    benefits: [
      "Never miss a follow-up",
      "Visual pipeline progress",
      "Automated reminders",
      "Revenue predictions"
    ],
    icon: HeartHandshake,
    color: "from-rose-300/30 to-pink-500/20",
    route: "/crm/customers"
  },
  finance: {
    name: "Finance",
    description: "Real-time financial insights. Spend control, approvals, and cash flow management in one place.",
    tagline: "Know your numbers, anytime",
    features: [
      "Expense tracking",
      "Approval workflows",
      "Invoice management",
      "Bank integrations",
      "Budget vs actual",
      "Financial reports"
    ],
    benefits: [
      "Control spend before it happens",
      "Automated approvals",
      "Real-time cash view",
      "Audit-ready reports"
    ],
    icon: Wallet,
    color: "from-emerald-300/30 to-teal-500/20",
    route: "/finance/transactions"
  },
  inventory: {
    name: "Inventory",
    description: "Smart stock management. Track inventory across warehouses, automate reordering, and prevent stockouts.",
    tagline: "Never run out, never overstock",
    features: [
      "Multi-warehouse tracking",
      "Stock alerts",
      "Barcode scanning",
      "Purchase orders",
      "Supplier management",
      "Low stock predictions"
    ],
    benefits: [
      "Prevent stockouts",
      "Auto-reorder suggestions",
      "Real-time visibility",
      "Reduce carrying costs"
    ],
    icon: Package,
    color: "from-lime-300/30 to-green-500/20",
    route: "/inventory/products"
  },
  commerce: {
    name: "Commerce",
    description: "Full e-commerce solution. Storefront, cart, checkout, and order management built-in.",
    tagline: "Sell anywhere, manage once",
    features: [
      "Online storefront",
      "Shopping cart",
      "Secure checkout",
      "Order management",
      "Payment integration",
      "Shipping labels"
    ],
    benefits: [
      "Launch in minutes",
      "Mobile-first design",
      "Automated order flow",
      "Multi-channel ready"
    ],
    icon: Store,
    color: "from-sky-300/30 to-cyan-500/20",
    route: "/commerce/orders"
  },
  export: {
    name: "Export",
    description: "Export documentation and compliance. Bills of lading, certificates, and shipment tracking.",
    tagline: "Global trade, simplified",
    features: [
      "Document generation",
      "Compliance certificates",
      "Shipment tracking",
      "Customs preparation",
      "HS code lookup",
      "Export reporting"
    ],
    benefits: [
      "Faster customs clearance",
      "Error-free documents",
      "Track every shipment",
      "Compliance built-in"
    ],
    icon: Truck,
    color: "from-indigo-300/30 to-blue-500/20",
    route: "/exports/orders"
  },
  analytics: {
    name: "Analytics",
    description: "Live dashboards and insights. KPI scorecards, forecasting, and business intelligence.",
    tagline: "Data that drives decisions",
    features: [
      "Real-time dashboards",
      "KPI scorecards",
      "Custom reports",
      "Forecasting",
      "Trend analysis",
      "Export to Excel"
    ],
    benefits: [
      "Know your business health",
      "Spot trends early",
      "Make data-driven decisions",
      "Share insights easily"
    ],
    icon: LineChart,
    color: "from-purple-300/30 to-fuchsia-500/20",
    route: "/analytics"
  },
  assistant: {
    name: "Assistant",
    description: "AI-powered copilot for your business. Proactive insights, automation, and instant answers.",
    tagline: "Your AI business partner",
    features: [
      "AI insights",
      "Automated workflows",
      "Smart suggestions",
      "Natural language queries",
      "Trend alerts",
      "Competitor tracking"
    ],
    benefits: [
      "Save hours daily",
      "Proactive recommendations",
      "Instant answers",
      "Continuous learning"
    ],
    icon: Bot,
    color: "from-cyan-300/30 to-emerald-500/20",
    route: "/assistant"
  }
};

export function generateStaticParams() {
  return Object.keys(apps).map((slug) => ({ slug }));
}

export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = apps[slug];

  if (!app) {
    notFound();
  }

  const Icon = app.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f8f8f8] to-[#f0f0f0]">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link
          href="/#apps"
          className="mb-8 inline-flex items-center gap-2 text-sm text-black/60 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to apps
        </Link>

        <div className="mb-12">
          <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${app.color} mb-6`}>
            <Icon className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-4xl font-semibold text-black">{app.name}</h1>
          <p className="mt-2 text-xl text-black/60">{app.tagline}</p>
        </div>

        <div className="mb-12 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-lg text-black/80">{app.description}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-black">Key Features</h2>
            <ul className="space-y-3">
              {app.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-black/70">
                  <Check className="h-5 w-5 text-emerald-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-black">Business Benefits</h2>
            <ul className="space-y-3">
              {app.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-black/70">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex gap-4">
          <Link href="/subscription/plans">
            <Button>Get Started</Button>
          </Link>
          <Link href={app.route}>
            <Button variant="secondary">Open App</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}