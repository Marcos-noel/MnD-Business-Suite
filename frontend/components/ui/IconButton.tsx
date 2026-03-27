"use client";

import { type HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/cn";

type Props = HTMLMotionProps<"button"> & {
  size?: "sm" | "md";
};

export function IconButton({ className, size = "md", ...props }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      className={cn(
        "focus-ring hairline inline-flex items-center justify-center rounded-2xl bg-[color-mix(in_oklab,hsl(var(--c-surface))_55%,transparent)] text-[hsl(var(--c-text))] backdrop-blur-xl transition",
        size === "sm" && "h-9 w-9",
        size === "md" && "h-10 w-10",
        "hover:bg-[color-mix(in_oklab,hsl(var(--c-surface))_75%,transparent)] active:bg-[color-mix(in_oklab,hsl(var(--c-surface))_75%,transparent)]",
        className
      )}
      {...props}
    />
  );
}
