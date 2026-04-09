export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/proxy/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // Handle validation errors with detailed messages
    if (res.status === 422 && data?.detail) {
      const errors = Array.isArray(data.detail) 
        ? data.detail.map((e: any) => `${e.loc?.join('.') || 'field'}: ${e.msg}`).join('; ')
        : data.detail;
      throw new Error(`Validation error: ${errors}`);
    }
    const msg = data?.error?.message ?? data?.detail ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

