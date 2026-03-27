"use client";

import { ThemeProvider } from "@/lib/theme";
import { QueryProvider } from "@/lib/query";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  );
}

