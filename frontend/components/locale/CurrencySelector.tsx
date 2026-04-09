"use client";

import { useLocale } from "@/lib/locale";

export function CurrencySelector() {
  const { country, setCountryCode } = useLocale();

  return (
    <select
      value={country.currency}
      onChange={(e) => {
        const target = country.countries.find((c) => c.currency === e.target.value);
        if (target) setCountryCode(target.code);
      }}
      className="rounded-md bg-transparent px-2 py-1 text-xs font-semibold uppercase tracking-wider text-black/70 outline-none hover:bg-black/5 cursor-pointer"
    >
      {country.countries.map((c) => (
        <option key={c.currency} value={c.currency}>
          {c.currency}
        </option>
      ))}
    </select>
  );
}