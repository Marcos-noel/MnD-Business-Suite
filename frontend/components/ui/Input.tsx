"use client";

import { cn } from "@/lib/cn";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "focus-ring hairline w-full rounded-2xl bg-[color-mix(in_oklab,hsl(var(--c-surface))_55%,transparent)] px-4 py-2 text-sm text-[hsl(var(--c-text))] outline-none placeholder:text-[hsl(var(--c-muted-2))] backdrop-blur-xl transition",
        props.className
      )}
    />
  );
}
