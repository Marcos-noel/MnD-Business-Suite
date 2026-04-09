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
        "focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 ease-ease-out",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-11 px-5 text-base",
        variant === "primary" &&
          "bg-black text-white shadow-sm hover:opacity-90",
        variant === "secondary" &&
          "bg-bg text-fg border border-border shadow-sm hover:bg-bg-light hover:shadow",
        variant === "ghost" &&
          "bg-transparent text-fg hover:bg-bg-light",
        variant === "destructive" &&
          "bg-error text-white shadow-sm hover:opacity-90",
        className
      )}
      {...props}
    />
  );
}
