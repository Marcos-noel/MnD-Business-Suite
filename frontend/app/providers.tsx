"use client";

import { ThemeProvider } from "@/lib/theme";
import { QueryProvider } from "@/lib/query";
import { LocaleProvider } from "@/lib/locale";
import { I18nProvider } from "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <LocaleProvider>
          <I18nProvider>{children}</I18nProvider>
        </LocaleProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
