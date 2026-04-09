import { backendUrl } from "@/lib/env";

export type LandingData = {
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  stats: { label: string; value: string }[];
  live_cards: { label: string; value: string }[];
  insight_note: string;
  security_title: string;
  security_description: string;
  enterprise_title: string;
  enterprise_description: string;
  enterprise_cards: { title: string; description: string }[];
  footer_title: string;
  footer_subtitle: string;
  contact_channels: { kind: string; value: string }[];
  contact_locations: string[];
  apps: { name: string; description: string; route: string; accent: string; category: string }[];
  flow_steps: { title: string; description: string }[];
  bundles: { name: string; description: string; monthly: number; highlight: string }[];
  enterprise_badges: string[];
  system_flow: string[];
  carousel: { image: string; title: string; description: string }[];
};

export type PricingData = {
  plans: {
    name: string;
    tagline: string;
    monthly: number;
    yearly: number;
    featured: boolean;
    limits: Record<string, string | number>;
    features: string[];
  }[];
  bundles: {
    bundle_id: string;
    name: string;
    description: string;
    monthly: number;
    highlight: string;
  }[];
  apps: {
    app_id: string;
    name: string;
    description: string;
    highlights: string[];
    tiers: { name: string; monthly: number; description: string }[];
  }[];
};

export async function getLandingData(): Promise<LandingData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    const res = await fetch(`${backendUrl()}/api/v1/marketing/landing`, {
      signal: controller.signal,
      next: { revalidate: 120 }
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error("Failed to load landing data");
    return res.json();
  } catch {
    return {
      hero_badge: "Built for modern growth teams",
      hero_title: "Run every part of your business from a single, intelligent suite.",
      hero_subtitle:
        "MnD replaces scattered tools with one operating system for people, money, inventory, commerce, and global trade.",
      stats: [
        { label: "Active orgs", value: "8,400+" },
        { label: "Active users", value: "42K" },
        { label: "Orders (30d)", value: "18K" },
        { label: "Revenue tracked", value: "$12.4M" }
      ],
      live_cards: [
        { label: "Revenue MTD", value: "$1.2M" },
        { label: "Avg order value", value: "$460" },
        { label: "Orders today", value: "128" },
        { label: "Low stock alerts", value: "6" }
      ],
      insight_note: "Optimize freight consolidation to reduce export costs by ~12%.",
      security_title: "Security baked in by default",
      security_description:
        "Role-based access, audit trails, export compliance, and secure integrations across the suite.",
      enterprise_title: "Scale with confidence",
      enterprise_description:
        "Built for regulated industries, export-heavy operations, and fast-growing teams that need secure controls, compliance tooling, and serious support.",
      enterprise_cards: [
        { title: "Migration Concierge", description: "Dedicated data migration delivered in weeks." },
        { title: "Custom Workflows", description: "Approval chains tailored to your compliance needs." }
      ],
      footer_title: "Start free, add apps, scale fast.",
      footer_subtitle: "Ready to build your suite?",
      contact_channels: [
        { kind: "phone", value: "+254 700 000 000" },
        { kind: "email", value: "hello@mndbusinesssuite.com" }
      ],
      contact_locations: ["Nairobi", "Dar es Salaam", "Lagos"],
      apps: [
        { name: "HR", description: "Onboarding, payroll, attendance, and employee lifecycle.", route: "/hr/employees", accent: "from-amber-300/30 to-orange-500/20", category: "people" },
        { name: "CRM", description: "Pipeline management, accounts, and intelligent follow-ups.", route: "/crm/customers", accent: "from-rose-300/30 to-pink-500/20", category: "revenue" },
        { name: "Finance", description: "Spend control, approvals, and real-time cash insights.", route: "/finance/transactions", accent: "from-emerald-300/30 to-teal-500/20", category: "finance" },
        { name: "Inventory", description: "Stock, purchasing, and multi-warehouse automation.", route: "/inventory/products", accent: "from-lime-300/30 to-green-500/20", category: "supply" },
        { name: "Commerce", description: "Storefront, checkout, and order orchestration.", route: "/commerce/orders", accent: "from-sky-300/30 to-cyan-500/20", category: "commerce" },
        { name: "Export", description: "Docs, compliance, and shipment orchestration.", route: "/exports/orders", accent: "from-indigo-300/30 to-blue-500/20", category: "trade" },
        { name: "Analytics", description: "Live dashboards, forecasting, and KPI scorecards.", route: "/analytics", accent: "from-purple-300/30 to-fuchsia-500/20", category: "insight" },
        { name: "Assistant", description: "AI copilots for proactive ops and answers.", route: "/assistant", accent: "from-cyan-300/30 to-emerald-500/20", category: "ai" }
      ],
      flow_steps: [
        { title: "Create your workspace", description: "Set up org, roles, and access." },
        { title: "Choose your apps", description: "Enable only what you need today." },
        { title: "Connect your data", description: "Sync tools and import spreadsheets." },
        { title: "Automate & scale", description: "AI insights and approvals in one flow." }
      ],
      bundles: [
        { name: "Operations Core", description: "HR + Finance + Inventory", monthly: 69, highlight: "Save 22%" },
        { name: "Revenue Engine", description: "CRM + Commerce + Analytics", monthly: 79, highlight: "Save 24%" },
        { name: "Global Trade Suite", description: "Export + Commerce + Finance + Analytics", monthly: 119, highlight: "Save 28%" },
        { name: "AI Performance", description: "Assistant + Analytics + CRM", monthly: 89, highlight: "Save 25%" }
      ],
      enterprise_badges: ["SOC-ready security", "99.95% uptime SLA", "Dedicated success lead", "Priority roadmap access"],
      system_flow: [
        "HR onboarding triggers payroll + access",
        "Sales deals create inventory reservations",
        "Shipments update finance and analytics",
        "AI flags compliance risks early"
      ]
    };
  }
}

export async function getPricingData(): Promise<PricingData> {
  try {
    const res = await fetch(`${backendUrl()}/api/v1/marketing/pricing`, {
      next: { revalidate: 300 }
    });
    if (!res.ok) throw new Error("Failed to load pricing data");
    return res.json();
  } catch {
    return {
      plans: [
        {
          name: "Starter",
          tagline: "For new teams",
          monthly: 29,
          yearly: 290,
          featured: false,
          limits: { users: 5, storage_gb: 10, automation_runs: "2K" },
          features: ["Core apps", "Email support", "Basic analytics"]
        },
        {
          name: "Growth",
          tagline: "For scaling ops",
          monthly: 79,
          yearly: 790,
          featured: true,
          limits: { users: 25, storage_gb: 150, automation_runs: "10K" },
          features: ["All core apps", "Workflow automation", "Priority support"]
        },
        {
          name: "Scale",
          tagline: "For multi-entity teams",
          monthly: 149,
          yearly: 1490,
          featured: false,
          limits: { users: 100, storage_gb: 500, automation_runs: "50K" },
          features: ["Advanced controls", "AI insights", "Dedicated success"]
        },
        {
          name: "Enterprise",
          tagline: "Custom governance",
          monthly: 299,
          yearly: 2990,
          featured: false,
          limits: { users: "Unlimited", storage_gb: "Unlimited", automation_runs: "Custom" },
          features: ["SLA", "Security reviews", "Custom integrations"]
        }
      ],
      bundles: [
        { bundle_id: "ops-core", name: "Operations Core", description: "HR + Finance + Inventory", monthly: 69, highlight: "Save 22%" },
        { bundle_id: "revenue-engine", name: "Revenue Engine", description: "CRM + Commerce + Analytics", monthly: 79, highlight: "Save 24%" },
        { bundle_id: "global-trade", name: "Global Trade Suite", description: "Export + Commerce + Finance + Analytics", monthly: 119, highlight: "Save 28%" },
        { bundle_id: "ai-performance", name: "AI Performance", description: "Assistant + Analytics + CRM", monthly: 89, highlight: "Save 25%" },
        { bundle_id: "full-suite", name: "Full Suite", description: "All apps, unlimited add-ons, premium success", monthly: 149, highlight: "Save 32%" }
      ],
      apps: []
    };
  }
}

export async function submitDemoRequest(payload: Record<string, unknown>) {
  const res = await fetch(`${backendUrl()}/api/v1/marketing/demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to submit demo request");
  return res.json();
}

export async function submitContactRequest(payload: Record<string, unknown>) {
  const res = await fetch(`${backendUrl()}/api/v1/marketing/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to submit contact request");
  return res.json();
}
