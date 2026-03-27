"use client";

import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("h-4 w-full rounded-xl bg-[color-mix(in_oklab,hsl(var(--c-text))_10%,transparent)]", className)} />;
}
