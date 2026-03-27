import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--c-bg))",
        surface: "hsl(var(--c-surface))",
        "surface-2": "hsl(var(--c-surface-2))",
        border: "hsl(var(--c-border))",
        fg: "hsl(var(--c-text))",
        muted: "hsl(var(--c-muted))",
        "muted-2": "hsl(var(--c-muted-2))",
        accent: "hsl(var(--c-accent))",
        "accent-2": "hsl(var(--c-accent-2))",
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
