"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type CacheValue = { data: unknown; at: number };

type QueryCtx = {
  get: (key: string) => CacheValue | undefined;
  set: (key: string, value: CacheValue) => void;
  invalidate: (prefix?: string) => void;
};

const Ctx = createContext<QueryCtx | null>(null);

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const cache = useRef(new Map<string, CacheValue>());
  const [, bump] = useState(0);

  const value = useMemo<QueryCtx>(
    () => ({
      get: (key) => cache.current.get(key),
      set: (key, v) => {
        cache.current.set(key, v);
        bump((x) => x + 1);
      },
      invalidate: (prefix) => {
        if (!prefix) cache.current.clear();
        else {
          for (const k of cache.current.keys()) if (k.startsWith(prefix)) cache.current.delete(k);
        }
        bump((x) => x + 1);
      }
    }),
    []
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useQuery<T>(key: string, queryFn: () => Promise<T>) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useQuery must be used within QueryProvider");
  const queryCtx = ctx;

  const cached = queryCtx.get(key)?.data as T | undefined;
  const [data, setData] = useState<T | undefined>(cached);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(cached == null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const next = await queryFn();
      queryCtx.set(key, { data: next, at: Date.now() });
      setData(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (cached !== undefined) setData(cached);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, cached]);

  useEffect(() => {
    if (cached != null) return;
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, error, loading, refetch: run };
}
