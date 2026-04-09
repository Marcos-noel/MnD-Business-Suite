from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter
from fastapi_cache.decorator import cache
from sqlalchemy import func, select

from app.core.deps import DbSession
from app.models.commerce.order import CommerceOrder
from app.models.finance.transaction import Transaction
from app.models.inventory.product import Product
from app.models.inventory.stock_movement import StockMovement
from app.models.marketing.lead import MarketingLead
from app.models.tenancy.organization import Organization
from app.models.auth.user import User
from app.schemas.marketing import (
    BundlePricing,
    ContactRequest,
    ContactResponse,
    DemoRequest,
    DemoResponse,
    LandingApp,
    LandingBundle,
    LandingFlowStep,
    LandingResponse,
    LandingStat,
    PricingResponse,
    PricingTier,
    AppPricing,
    AppPricingTier,
)
from app.core.fx_cache import ensure_fx_snapshot, refresh_fx_rates



router = APIRouter(prefix="/marketing")


def _format_compact(value: float) -> str:
    if value >= 1_000_000:
        return f"{value/1_000_000:.1f}M"
    if value >= 1_000:
        return f"{value/1_000:.1f}K"
    return f"{int(value)}"


@router.get("/landing", response_model=LandingResponse)
@cache(expire=120)
async def landing(session: DbSession) -> LandingResponse:
    end = date.today()
    start = end - timedelta(days=30)

    orgs = (await session.execute(select(func.count()).select_from(Organization))).scalar_one()
    users = (await session.execute(select(func.count()).select_from(User))).scalar_one()
    orders_30d = (
        await session.execute(
            select(func.count()).select_from(CommerceOrder).where(CommerceOrder.created_at >= start)
        )
    ).scalar_one()
    revenue_30d = (
        await session.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0))
            .where(Transaction.kind == "revenue")
            .where(Transaction.day >= start)
        )
    ).scalar_one()

    stats = [
        LandingStat(label="Active orgs", value=f"{_format_compact(orgs)}+"),
        LandingStat(label="Active users", value=f"{_format_compact(users)}"),
        LandingStat(label="Orders (30d)", value=_format_compact(float(orders_30d))),
        LandingStat(label="Revenue tracked", value=f"${_format_compact(float(revenue_30d))}"),
    ]

    avg_order_value = float(revenue_30d) / float(orders_30d or 1)
    low_stock_count = (
        await session.execute(
            select(func.count())
            .select_from(Product)
            .outerjoin(
                StockMovement,
                (StockMovement.product_id == Product.id) & (StockMovement.org_id == Product.org_id),
            )
            .group_by(Product.id, Product.reorder_level)
            .having(func.coalesce(func.sum(StockMovement.quantity_delta), 0) <= Product.reorder_level)
        )
    ).all()
    low_stock_total = len(low_stock_count)

    live_cards = [
        LandingStat(label="Revenue MTD", value=f"${_format_compact(float(revenue_30d))}"),
        LandingStat(label="Avg order value", value=f"${_format_compact(avg_order_value)}"),
        LandingStat(label="Orders today", value=_format_compact(max(orders_30d // 30, 1))),
        LandingStat(label="Low stock alerts", value=str(low_stock_total)),
    ]

    apps = [
        LandingApp(
            name="HR",
            description="Onboarding, payroll, attendance, and employee lifecycle.",
            route="/hr/employees",
            accent="from-amber-300/30 to-orange-500/20",
            category="people",
        ),
        LandingApp(
            name="CRM",
            description="Pipeline management, accounts, and intelligent follow-ups.",
            route="/crm/customers",
            accent="from-rose-300/30 to-pink-500/20",
            category="revenue",
        ),
        LandingApp(
            name="Finance",
            description="Spend control, approvals, and real-time cash insights.",
            route="/finance/transactions",
            accent="from-emerald-300/30 to-teal-500/20",
            category="finance",
        ),
        LandingApp(
            name="Inventory",
            description="Stock, purchasing, and multi-warehouse automation.",
            route="/inventory/products",
            accent="from-lime-300/30 to-green-500/20",
            category="supply",
        ),
        LandingApp(
            name="Commerce",
            description="Storefront, checkout, and order orchestration.",
            route="/commerce/orders",
            accent="from-sky-300/30 to-cyan-500/20",
            category="commerce",
        ),
        LandingApp(
            name="Export",
            description="Docs, compliance, and shipment orchestration.",
            route="/exports/orders",
            accent="from-indigo-300/30 to-blue-500/20",
            category="trade",
        ),
        LandingApp(
            name="Analytics",
            description="Live dashboards, forecasting, and KPI scorecards.",
            route="/analytics",
            accent="from-purple-300/30 to-fuchsia-500/20",
            category="insight",
        ),
        LandingApp(
            name="Assistant",
            description="AI copilots for proactive ops and answers.",
            route="/assistant",
            accent="from-cyan-300/30 to-emerald-500/20",
            category="ai",
        ),
    ]

    flow_steps = [
        LandingFlowStep(title="Create your workspace", description="Set up org, roles, and access."),
        LandingFlowStep(title="Choose your apps", description="Enable only what you need today."),
        LandingFlowStep(title="Connect your data", description="Sync tools and import spreadsheets."),
        LandingFlowStep(title="Automate & scale", description="AI insights and approvals in one flow."),
    ]

    bundles = [
        LandingBundle(
            name="Operations Core",
            description="HR + Finance + Inventory",
            monthly=69,
            highlight="Save 22%",
        ),
        LandingBundle(
            name="Revenue Engine",
            description="CRM + Commerce + Analytics",
            monthly=79,
            highlight="Save 24%",
        ),
        LandingBundle(
            name="Global Trade Suite",
            description="Export + Commerce + Finance + Analytics",
            monthly=119,
            highlight="Save 28%",
        ),
        LandingBundle(
            name="AI Performance",
            description="Assistant + Analytics + CRM",
            monthly=89,
            highlight="Save 25%",
        ),
    ]

    return LandingResponse(
        hero_badge="Built for modern growth teams",
        hero_title="Run every part of your business from a single, intelligent suite.",
        hero_subtitle=(
            "MnD replaces scattered tools with one operating system for people, "
            "money, inventory, commerce, and global trade."
        ),
        stats=stats,
        live_cards=live_cards,
        insight_note="Optimize freight consolidation to reduce export costs by ~12%.",
        security_title="Security baked in by default",
        security_description=(
            "Role-based access, audit trails, export compliance, and secure integrations across the suite."
        ),
        enterprise_title="Scale with confidence",
        enterprise_description=(
            "Built for regulated industries, export-heavy operations, and fast-growing teams that need secure "
            "controls, compliance tooling, and serious support."
        ),
        enterprise_cards=[
            {"title": "Migration Concierge", "description": "Dedicated data migration delivered in weeks."},
            {"title": "Custom Workflows", "description": "Approval chains tailored to your compliance needs."},
        ],
        footer_title="Start free, add apps, scale fast.",
        footer_subtitle="Ready to build your suite?",
        contact_channels=[
            {"kind": "phone", "value": "+254 700 000 000"},
            {"kind": "email", "value": "hello@mndbusinesssuite.com"},
        ],
        contact_locations=["Nairobi", "Dar es Salaam", "Lagos"],
        apps=apps,
        flow_steps=flow_steps,
        bundles=bundles,
        enterprise_badges=[
            "SOC-ready security",
            "99.95% uptime SLA",
            "Dedicated success lead",
            "Priority roadmap access",
        ],
        system_flow=[
            "HR onboarding triggers payroll + access",
            "Sales deals create inventory reservations",
            "Shipments update finance and analytics",
            "AI flags compliance risks early",
        ],
    )


@router.get("/pricing", response_model=PricingResponse)
@cache(expire=300)
async def pricing() -> PricingResponse:
    plans = [
        PricingTier(
            name="Starter",
            tagline="For new teams",
            monthly=29,
            yearly=290,
            featured=False,
            limits={"users": 5, "storage_gb": 10, "automation_runs": "2K"},
            features=["Core apps", "Email support", "Basic analytics"],
        ),
        PricingTier(
            name="Growth",
            tagline="For scaling ops",
            monthly=79,
            yearly=790,
            featured=True,
            limits={"users": 25, "storage_gb": 150, "automation_runs": "10K"},
            features=["All core apps", "Workflow automation", "Priority support"],
        ),
        PricingTier(
            name="Scale",
            tagline="For multi-entity teams",
            monthly=149,
            yearly=1490,
            featured=False,
            limits={"users": 100, "storage_gb": 500, "automation_runs": "50K"},
            features=["Advanced controls", "AI insights", "Dedicated success"],
        ),
        PricingTier(
            name="Enterprise",
            tagline="Custom governance",
            monthly=299,
            yearly=2990,
            featured=False,
            limits={"users": "Unlimited", "storage_gb": "Unlimited", "automation_runs": "Custom"},
            features=["SLA", "Security reviews", "Custom integrations"],
        ),
    ]

    bundles = [
        BundlePricing(
            bundle_id="ops-core",
            name="Operations Core",
            description="HR + Finance + Inventory",
            monthly=69,
            highlight="Save 22%",
        ),
        BundlePricing(
            bundle_id="revenue-engine",
            name="Revenue Engine",
            description="CRM + Commerce + Analytics",
            monthly=79,
            highlight="Save 24%",
        ),
        BundlePricing(
            bundle_id="global-trade",
            name="Global Trade Suite",
            description="Export + Commerce + Finance + Analytics",
            monthly=119,
            highlight="Save 28%",
        ),
        BundlePricing(
            bundle_id="ai-performance",
            name="AI Performance",
            description="Assistant + Analytics + CRM",
            monthly=89,
            highlight="Save 25%",
        ),
        BundlePricing(
            bundle_id="full-suite",
            name="Full Suite",
            description="All apps, unlimited add-ons, premium success",
            monthly=149,
            highlight="Save 32%",
        ),
    ]

    apps = [
        AppPricing(
            app_id="hr",
            name="HR",
            description="Onboarding, time, payroll, and performance.",
            highlights=["Time tracking", "Leave automation", "Payroll exports"],
            tiers=[
                AppPricingTier(name="Starter", monthly=12, description="Essentials"),
                AppPricingTier(name="Growth", monthly=22, description="Teams & automation"),
                AppPricingTier(name="Scale", monthly=38, description="Advanced controls"),
            ],
        ),
        AppPricing(
            app_id="crm",
            name="CRM",
            description="Pipeline, account intelligence, and sales automation.",
            highlights=["Smart pipelines", "Deal scoring", "Email sequences"],
            tiers=[
                AppPricingTier(name="Starter", monthly=14, description="Essentials"),
                AppPricingTier(name="Growth", monthly=25, description="Teams & automation"),
                AppPricingTier(name="Scale", monthly=45, description="Advanced controls"),
            ],
        ),
        AppPricing(
            app_id="finance",
            name="Finance",
            description="Invoices, approvals, and compliance.",
            highlights=["Approvals", "Spend controls", "Audit trails"],
            tiers=[
                AppPricingTier(name="Starter", monthly=18, description="Essentials"),
                AppPricingTier(name="Growth", monthly=32, description="Teams & automation"),
                AppPricingTier(name="Scale", monthly=58, description="Advanced controls"),
            ],
        ),
        AppPricing(
            app_id="inventory",
            name="Inventory",
            description="Stock, purchasing, and warehouses.",
            highlights=["Reorder rules", "Supplier portal", "Serial tracking"],
            tiers=[
                AppPricingTier(name="Starter", monthly=15, description="Essentials"),
                AppPricingTier(name="Growth", monthly=27, description="Teams & automation"),
                AppPricingTier(name="Scale", monthly=48, description="Advanced controls"),
            ],
        ),
        AppPricing(
            app_id="commerce",
            name="Commerce",
            description="Storefront, checkout, and order ops.",
            highlights=["Fast checkout", "Cart recovery", "Multi-currency"],
            tiers=[
                AppPricingTier(name="Starter", monthly=20, description="Essentials"),
                AppPricingTier(name="Growth", monthly=36, description="Teams & automation"),
                AppPricingTier(name="Scale", monthly=64, description="Advanced controls"),
            ],
        ),
        AppPricing(
            app_id="export",
            name="Export",
            description="Trade docs, compliance, and shipment ops.",
            highlights=["Docs automation", "Compliance checks", "Port visibility"],
            tiers=[
                AppPricingTier(name="Starter", monthly=25, description="Essentials"),
                AppPricingTier(name="Growth", monthly=45, description="Teams & automation"),
                AppPricingTier(name="Scale", monthly=80, description="Advanced controls"),
            ],
        ),
        AppPricing(
            app_id="analytics",
            name="Analytics",
            description="Dashboards, forecasting, and KPI boards.",
            highlights=["Live KPIs", "Forecasting", "Custom dashboards"],
            tiers=[
                AppPricingTier(name="Starter", monthly=16, description="Essentials"),
                AppPricingTier(name="Growth", monthly=28, description="Teams & automation"),
                AppPricingTier(name="Scale", monthly=50, description="Advanced controls"),
            ],
        ),
        AppPricing(
            app_id="assistant",
            name="Assistant",
            description="AI copilots across every workspace.",
            highlights=["AI answers", "Workflow automation", "Insight alerts"],
            tiers=[
                AppPricingTier(name="Starter", monthly=22, description="Essentials"),
                AppPricingTier(name="Growth", monthly=39, description="Teams & automation"),
                AppPricingTier(name="Scale", monthly=68, description="Advanced controls"),
            ],
        ),
    ]

    return PricingResponse(plans=plans, bundles=bundles, apps=apps)


@router.get("/fx")
async def fx_rates() -> dict:
    snapshot = await refresh_fx_rates()
    if snapshot is None:
        snapshot = ensure_fx_snapshot()
    return {
        "base": snapshot.base,
        "rates": snapshot.rates,
        "updated_at": snapshot.updated_at.isoformat(),
        "source": snapshot.source,
    }


@router.post("/demo", response_model=DemoResponse)
async def demo_request(payload: DemoRequest, session: DbSession) -> DemoResponse:
    lead = MarketingLead(
        name=payload.name,
        email=str(payload.email),
        company=payload.company,
        role=payload.role,
        company_size=payload.company_size,
        phone=payload.phone or "",
        country=payload.country,
        preferred_timeframe=payload.preferred_timeframe,
        interest_area=payload.interest_area,
        notes=payload.notes or "",
        source="demo",
    )
    session.add(lead)
    await session.commit()
    await session.refresh(lead)
    return DemoResponse(ok=True, reference_id=lead.id)


@router.post("/contact", response_model=ContactResponse)
async def contact_request(payload: ContactRequest, session: DbSession) -> ContactResponse:
    lead = MarketingLead(
        name=payload.name,
        email=str(payload.email),
        company=payload.company,
        role="",
        company_size="",
        phone=payload.phone or "",
        country="",
        preferred_timeframe="",
        interest_area=payload.topic,
        notes=payload.message,
        source="contact",
    )
    session.add(lead)
    await session.commit()
    await session.refresh(lead)
    return ContactResponse(ok=True, reference_id=lead.id)
