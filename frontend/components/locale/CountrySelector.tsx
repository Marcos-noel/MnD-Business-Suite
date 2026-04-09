"use client";

import { useLocale, flagEmoji } from "@/lib/locale";

export function CountrySelector() {
  const { country, countries, setCountryCode } = useLocale();

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--c-muted))] shadow-sm">
      <span className="text-base">{flagEmoji(country.code)}</span>
      <select
        value={country.code}
        onChange={(e) => setCountryCode(e.target.value)}
        className="bg-transparent text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--c-muted))] outline-none"
      >
        {countries.map((item) => (
          <option key={item.code} value={item.code}>
            {item.name} ({item.currency})
          </option>
        ))}
      </select>
    </div>
  );
}
