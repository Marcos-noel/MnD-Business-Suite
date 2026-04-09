from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class LandingStat(BaseModel):
    label: str
    value: str


class LandingApp(BaseModel):
    name: str
    description: str
    route: str
    accent: str
    category: str


class LandingFlowStep(BaseModel):
    title: str
    description: str


class LandingCard(BaseModel):
    title: str
    description: str


class ContactChannel(BaseModel):
    kind: str
    value: str


class LandingBundle(BaseModel):
    name: str
    description: str
    monthly: float
    highlight: str


class LandingResponse(BaseModel):
    hero_badge: str
    hero_title: str
    hero_subtitle: str
    stats: list[LandingStat]
    live_cards: list[LandingStat]
    insight_note: str
    security_title: str
    security_description: str
    enterprise_title: str
    enterprise_description: str
    enterprise_cards: list[LandingCard]
    footer_title: str
    footer_subtitle: str
    contact_channels: list[ContactChannel]
    contact_locations: list[str]
    apps: list[LandingApp]
    flow_steps: list[LandingFlowStep]
    bundles: list[LandingBundle]
    enterprise_badges: list[str]
    system_flow: list[str]


class PricingTier(BaseModel):
    name: str
    tagline: str
    monthly: float
    yearly: float
    featured: bool = False
    limits: dict[str, str | int]
    features: list[str]


class AppPricingTier(BaseModel):
    name: str
    monthly: float
    description: str


class AppPricing(BaseModel):
    app_id: str
    name: str
    description: str
    highlights: list[str]
    tiers: list[AppPricingTier]


class BundlePricing(BaseModel):
    bundle_id: str
    name: str
    description: str
    monthly: float
    highlight: str


class PricingResponse(BaseModel):
    plans: list[PricingTier]
    bundles: list[BundlePricing]
    apps: list[AppPricing]


class DemoRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    company: str = Field(min_length=2, max_length=200)
    role: str = Field(min_length=2, max_length=120)
    company_size: str = Field(min_length=1, max_length=40)
    phone: str | None = Field(default=None, max_length=40)
    country: str = Field(min_length=2, max_length=80)
    preferred_timeframe: str = Field(min_length=2, max_length=120)
    interest_area: str = Field(min_length=2, max_length=120)
    notes: str | None = Field(default=None, max_length=1000)


class DemoResponse(BaseModel):
    ok: bool
    reference_id: str


class ContactRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    company: str = Field(min_length=2, max_length=200)
    message: str = Field(min_length=10, max_length=2000)
    topic: str = Field(min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=40)


class ContactResponse(BaseModel):
    ok: bool
    reference_id: str
