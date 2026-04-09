"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStoredAuth } from "@/lib/auth";

export default function AccountPage() {
  const params = useParams();
  const router = useRouter();
  const org = params.org as string;

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth) {
      router.replace(`/store/${org}/login?redirect=/store/${org}/account`);
      return;
    }
    router.replace(`/store/${org}/account/orders`);
  }, [org, router]);

  return (
    <div className="min-h-screen bg-[hsl(var(--c-bg))] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--c-accent))] mx-auto"></div>
        <p className="mt-4 text-sm text-[hsl(var(--c-muted))]">Preparing your account...</p>
      </div>
    </div>
  );
}
