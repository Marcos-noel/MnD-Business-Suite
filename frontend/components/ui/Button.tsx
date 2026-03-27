"use client";

import { type HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/cn";

type Props = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition duration-200 ease-ease-out",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-5 text-base",
        variant === "primary" &&
          "bg-[hsl(var(--c-text))] text-[hsl(var(--c-bg))] shadow-pop hover:opacity-95",
        variant === "secondary" &&
          "surface-2 text-[hsl(var(--c-text))] shadow-elevate hover:shadow-pop",
        variant === "ghost" &&
          "hairline bg-transparent text-[hsl(var(--c-text))] hover:bg-[color-mix(in_oklab,hsl(var(--c-surface))_55%,transparent)]",
        variant === "destructive" &&
          "bg-[hsl(var(--c-danger))] text-white shadow-pop hover:opacity-95",
        className
      )}
      {...props}
    />
  );
}
