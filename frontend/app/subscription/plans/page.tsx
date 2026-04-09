import PricingClient from "@/app/subscription/plans/PricingClient";
import { getPricingData } from "@/lib/marketing";

export const dynamic = "force-dynamic";

export default async function SubscriptionPlansPage() {
  const data = await getPricingData();
  return <PricingClient data={data} />;
}
