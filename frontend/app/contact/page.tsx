import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import ContactForm from "@/app/contact/ContactForm";
import { getLandingData } from "@/lib/marketing";
import { Phone, Mail, MapPin } from "lucide-react";
import { CountrySelector } from "@/components/locale/CountrySelector";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const landing = await getLandingData();

  return (
    <div className="page-transition min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.12),transparent_45%),radial-gradient(circle_at_top_right,rgba(147,197,253,0.14),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.02),transparent_70%)]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-[hsl(var(--c-text-secondary))] hover:text-[hsl(var(--c-text))]">
            ← Back to home
          </Link>
          <CountrySelector />
        </div>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold text-[hsl(var(--c-text))] md:text-5xl">
              Let’s build your operating system
            </h1>
            <p className="text-lg text-[hsl(var(--c-text-secondary))]">
              Tell us what you’re building. Our team will map the right stack, demo, and rollout plan.
            </p>
            <div className="grid gap-4">
              {landing.enterprise_badges.map((item) => (
                <Card key={item} className="p-4">
                  <p className="text-sm font-semibold text-[hsl(var(--c-text))]">{item}</p>
                  <p className="text-xs text-[hsl(var(--c-text-secondary))]">
                    Enterprise-grade commitments built in.
                  </p>
                </Card>
              ))}
            </div>
            <div className="grid gap-3 rounded-3xl bg-white/80 p-6">
              {landing.contact_channels.map((channel) => (
                <div key={channel.kind} className="flex items-center gap-3 text-sm text-[hsl(var(--c-text-secondary))]">
                  {channel.kind === "phone" && <Phone className="h-4 w-4" />}
                  {channel.kind === "email" && <Mail className="h-4 w-4" />}
                  {channel.value}
                </div>
              ))}
              <div className="flex items-center gap-3 text-sm text-[hsl(var(--c-text-secondary))]">
                <MapPin className="h-4 w-4" />
                {landing.contact_locations.join(" · ")}
              </div>
              <Link href="/demo">
                <Button size="lg" variant="secondary" className="mt-2">
                  Schedule a Demo
                </Button>
              </Link>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  );
}
