"use client";

import { cn } from "@/lib/cn";

export function Badge({
  className,
  variant = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "neutral" | "secondary" | "success" | "warning" | "danger" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        variant === "neutral" && "border-[hsl(var(--c-border))] bg-[color-mix(in_oklab,hsl(var(--c-surface))_60%,transparent)] text-[hsl(var(--c-text))]",
        variant === "secondary" && "border-[hsl(var(--c-border))] bg-[color-mix(in_oklab,hsl(var(--c-surface))_45%,transparent)] text-[hsl(var(--c-muted))]",
        variant === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
        variant === "warning" && "border-amber-500/30 bg-amber-500/10 text-amber-200",
        variant === "danger" && "border-red-500/30 bg-red-500/10 text-red-200",
        variant === "accent" && "border-[hsl(var(--c-border))] bg-[hsl(var(--c-accent))]/15 text-[hsl(var(--c-text))]",
        className
      )}
      {...props}
    />
  );
}
