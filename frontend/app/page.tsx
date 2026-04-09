import { getLandingData } from "@/lib/marketing";
import { LandingClient } from "@/app/_components/LandingClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const landing = await getLandingData();
  return <LandingClient landing={landing} />;
}
