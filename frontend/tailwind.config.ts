import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF"
        },
        bg: {
          DEFAULT: "#FFFFFF",
          light: "#F9FAFB"
        },
        fg: {
          DEFAULT: "#111827",
          muted: "#6B7280"
        },
        border: {
          DEFAULT: "#E5E7EB",
          input: "#D1D5DB"
        },
        success: "#10B981",
        error: "#EF4444",
        danger: "hsl(var(--c-danger))"
      },
      borderRadius: {
        "2xl": "var(--radius-lg)"
      },
      boxShadow: {
        glass: "var(--shadow-1)",
        elevate: "var(--shadow-2)",
        pop: "var(--shadow-pop)"
      },
      transitionTimingFunction: {
        "ease-out": "var(--ease-out)",
        "ease-in-out": "var(--ease-in-out)"
      }
    }
  },
  plugins: []
} satisfies Config;
