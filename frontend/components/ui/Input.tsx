"use client";

import { cn } from "@/lib/cn";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "focus-ring w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-fg outline-none placeholder:text-fg-muted transition-all focus:border-black focus:ring-2 focus:ring-black/20",
        props.className
      )}
    />
  );
}
