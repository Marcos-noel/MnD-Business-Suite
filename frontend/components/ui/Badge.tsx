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
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variant === "neutral" && "border-border bg-bg text-fg",
        variant === "secondary" && "border-border bg-bg-light text-fg-muted",
        variant === "success" && "border-success/30 bg-success/10 text-success",
        variant === "warning" && "border-amber-500/30 bg-amber-500/10 text-amber-600",
        variant === "danger" && "border-error/30 bg-error/10 text-error",
        variant === "accent" && "border-black/30 bg-black/10 text-black",
        className
      )}
      {...props}
    />
  );
}
