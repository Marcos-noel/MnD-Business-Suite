"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Logo } from "@/components/ui/Logo";
import { getStoredAuth } from "@/lib/auth";
import { useLocale } from "@/lib/locale";
import { CountrySelector } from "@/components/locale/CountrySelector";
import { useI18n } from "@/lib/i18n";
import {
  Check,
  Star,
  Zap,
  Crown,
  Building,
  BarChart3,
  Brain,
  Code,
  ArrowRight,
  Sparkles
} from "lucide-react";
import type { PricingData } from "@/lib/marketing";

const planIcons = {
  Starter: Star,
  Growth: Zap,
  Scale: Building,
  Enterprise: Crown
};

export default function PricingClient({ data }: { data: PricingData }) {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { formatCurrency } = useLocale();
  const { t } = useI18n();

  useEffect(() => {
    const auth = getStoredAuth();
    setIsAuthenticated(!!auth);
  }, []);

  const handleSelectPlan = (planId: string) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/subscription/plans&plan=${planId}`);
      return;
    }
    router.push(`/dashboard?upgrade=${planId}`);
  };

  const formatLimit = (limit: number | string) => {
    if (limit === -1) return "Unlimited";
    if (typeof limit === "string") return limit;
    return limit.toLocaleString();
  };

  const getSavings = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0;
    const monthlyTotal = monthly * 12;
    return Math.round(((monthlyTotal - yearly) / monthlyTotal) * 100);
  };

  const priceForCycle = (monthly: number, yearly: number) =>
    billingCycle === "monthly" ? monthly : yearly;

  const formatPrice = (monthly: number, yearly?: number) =>
    formatCurrency(billingCycle === "monthly" ? monthly : yearly ?? monthly * 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo showText />
            <CountrySelector />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mt-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("nav_pricing")}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Scale your export business with our comprehensive platform
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 mb-8">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors relative ${
                billingCycle === "yearly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yearly
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                Save up to 25%
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {data.plans.map((plan) => {
            const Icon = planIcons[plan.name as keyof typeof planIcons] || Star;
            const price = priceForCycle(plan.monthly, plan.yearly);
            const savings = getSavings(plan.monthly, plan.yearly);

            return (
              <Card
                key={plan.name}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.featured
                    ? "ring-2 ring-blue-500 shadow-lg scale-105"
                    : "hover:scale-102"
                }`}
              >
                {plan.featured && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <div className="p-6 pt-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {plan.tagline}
                    </p>

                    {/* Pricing */}
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatCurrency(price)}
                        </span>
                        <span className="text-gray-600 ml-2">
                          /{billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      </div>
                      {billingCycle === "yearly" && savings > 0 && (
                        <div className="text-green-600 text-sm font-medium mt-1">
                          Save {savings}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Limits */}
                  <div className="space-y-3 mb-6">
                    {Object.entries(plan.limits).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600">{key.replace(/_/g, " ")}:</span>
                        <span className="font-medium">{formatLimit(value)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-900">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan.name)}
                    className={`w-full ${
                      plan.featured
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        : ""
                    }`}
                    variant={plan.featured ? "default" : "outline"}
                  >
                    Choose Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bundle Offers */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Best-Selling Bundles
            </h2>
            <p className="text-gray-600">
              Curated app combinations with automatic discounts
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.bundles.map((bundle) => (
              <Card key={bundle.bundle_id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{bundle.name}</h3>
                    <p className="text-sm text-gray-600">{bundle.description}</p>
                  </div>
                  <Badge className="bg-green-500 text-white text-xs">{bundle.highlight}</Badge>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(bundle.monthly)}
                  </span>
                  <span className="text-sm text-gray-500">
                    /{billingCycle === "monthly" ? "mo" : "yr"}
                  </span>
                </div>
                <Button className="w-full" onClick={() => handleSelectPlan(bundle.bundle_id)}>
                  Choose Bundle
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* App Pricing */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Plans for Every App
            </h2>
            <p className="text-gray-600">
              Start with one app and scale up anytime
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.apps.map((app) => (
              <Card key={app.app_id} className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Star className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{app.name}</h3>
                      <p className="text-sm text-gray-600">{app.description}</p>
                    </div>
                  </div>
                  <Badge className="bg-slate-100 text-slate-700 text-xs">Per App</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {app.tiers.map((tier) => (
                    <div key={tier.name} className="rounded-lg border border-gray-200 p-4">
                      <p className="text-sm font-semibold text-gray-900">{tier.name}</p>
                      <p className="text-xs text-gray-500 mb-2">{tier.description}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(tier.monthly)}
                      </p>
                      <p className="text-xs text-gray-500">
                        /{billingCycle === "monthly" ? "mo" : "yr"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {app.highlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Flagship Apps Section */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <div className="p-8">
              <div className="text-center mb-8">
                <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Flagship Applications
                </h2>
                <p className="text-xl text-gray-600">
                  Exclusive AI-powered tools for Flagship subscribers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <Brain className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">AI Insights Engine</h3>
                  <p className="text-sm text-gray-600">
                    Predictive analytics, demand forecasting, and intelligent recommendations
                  </p>
                </div>
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                  <p className="text-sm text-gray-600">
                    Custom dashboards, real-time KPIs, and comprehensive reporting
                  </p>
                </div>
                <div className="text-center">
                  <Code className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Developer Platform</h3>
                  <p className="text-sm text-gray-600">
                    Full API access, webhooks, and custom integrations
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, all paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, we offer a 30-day money-back guarantee for all paid plans.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Ready to Scale Your Export Business?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of exporters who trust MnD Business Suite
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => router.push("/contact")}
              >
                Contact Sales
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => router.push("/demo")}
              >
                Schedule Demo
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
