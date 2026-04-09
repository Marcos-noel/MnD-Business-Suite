"use client";

import { createContext, useContext, useMemo } from "react";
import { useLocale } from "@/lib/locale";

type Dict = Record<string, string>;

const DICTIONARIES: Record<string, Dict> = {
  en: {
    nav_apps: "Apps",
    nav_flow: "How It Works",
    nav_pricing: "Pricing",
    nav_sign_in: "Sign In",
    cta_get_started: "Get Started",
    cta_start_bundle: "Start with a Bundle",
    cta_explore_storefront: "Explore Storefront",
    section_suite_apps: "Suite Apps",
    section_flow: "End-to-End Flow",
    section_pricing: "Bundles & Offers",
    section_enterprise: "Enterprise Ready",
    cta_talk_sales: "Talk to Sales",
    cta_view_plans: "View Plans",
    cta_schedule_demo: "Schedule Demo",
    bundles_offers: "Bundles & Offers",
    pick_bundle: "Pick Your Perfect Bundle",
    monthly: "Monthly",
    annual: "Yearly",
    per_org: "per org",
    month: "month",
    year: "year",
    see_bundle: "See Bundle",
  },
  fr: {
    nav_apps: "Applications",
    nav_flow: "Comment ça marche",
    nav_pricing: "Tarifs",
    nav_sign_in: "Se connecter",
    cta_get_started: "Commencer",
    cta_start_bundle: "Choisir un pack",
    cta_explore_storefront: "Voir la boutique",
    section_suite_apps: "Suite d'apps",
    section_flow: "Parcours complet",
    section_pricing: "Offres",
    section_enterprise: "Entreprise",
    cta_talk_sales: "Contacter les ventes",
    cta_view_plans: "Voir les offres",
    cta_schedule_demo: "Planifier une démo",
    bundles_offers: "Packs et Offres",
    pick_bundle: "Choisissez Votre Pack Parfait",
    monthly: "Mensuel",
    annual: "Annuel",
    per_org: "par org",
    month: "mois",
    year: "an",
    see_bundle: "Voir le pack",
  },
  de: {
    nav_apps: "Apps",
    nav_flow: "So funktioniert’s",
    nav_pricing: "Preise",
    nav_sign_in: "Anmelden",
    cta_get_started: "Jetzt starten",
    cta_start_bundle: "Bundle wählen",
    cta_explore_storefront: "Storefront ansehen",
    section_suite_apps: "Suite-Apps",
    section_flow: "Ablauf",
    section_pricing: "Pakete & Angebote",
    section_enterprise: "Enterprise",
    cta_talk_sales: "Vertrieb kontaktieren",
    cta_view_plans: "Pläne ansehen",
    cta_schedule_demo: "Demo buchen",
  },
  pt: {
    nav_apps: "Aplicativos",
    nav_flow: "Como funciona",
    nav_pricing: "Preços",
    nav_sign_in: "Entrar",
    cta_get_started: "Começar",
    cta_start_bundle: "Escolher pacote",
    cta_explore_storefront: "Ver loja",
    section_suite_apps: "Suíte de apps",
    section_flow: "Fluxo completo",
    section_pricing: "Ofertas",
    section_enterprise: "Enterprise",
    cta_talk_sales: "Falar com vendas",
    cta_view_plans: "Ver planos",
    cta_schedule_demo: "Agendar demo",
  },
  ar: {
    nav_apps: "التطبيقات",
    nav_flow: "كيف يعمل",
    nav_pricing: "الأسعار",
    nav_sign_in: "تسجيل الدخول",
    cta_get_started: "ابدأ الآن",
    cta_start_bundle: "ابدأ بحزمة",
    cta_explore_storefront: "استعرض المتجر",
    section_suite_apps: "حزمة التطبيقات",
    section_flow: "التدفق الكامل",
    section_pricing: "العروض",
    section_enterprise: "المؤسسات",
    cta_talk_sales: "تواصل مع المبيعات",
    cta_view_plans: "عرض الخطط",
    cta_schedule_demo: "حجز عرض",
  },
  sw: {
    nav_apps: "Programu",
    nav_flow: "Jinsi Inavyofanya",
    nav_pricing: "Bei",
    nav_sign_in: "Ingia",
    cta_get_started: "Anza",
    cta_start_bundle: "Anza na Kifurushi",
    cta_explore_storefront: "Tazama Duka",
    section_suite_apps: "Programu za Suite",
    section_flow: "Mtiririko Kamili",
    section_pricing: "Ofa",
    section_enterprise: "Biashara Kubwa",
    cta_talk_sales: "Wasiliana na Mauzo",
    cta_view_plans: "Tazama Mipango",
    cta_schedule_demo: "Panga Demo",
  }
};

type I18nContextValue = {
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { country } = useLocale();
  const dict = DICTIONARIES[country.languageCode] ?? DICTIONARIES.en;

  const value = useMemo<I18nContextValue>(
    () => ({
      t: (key: string) => dict[key] ?? DICTIONARIES.en[key] ?? key
    }),
    [dict]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
