"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CustomerUser, getStoredAuth, setStoredAuth } from "@/lib/auth";

type AuthResponse = { customer: CustomerUser; token: string } | CustomerUser;

export default function StoreLoginPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const org = params.org as string;
  const orgSlug = org;
  const redirectParam = searchParams.get("redirect");
  const redirect = useMemo(() => {
    if (redirectParam && redirectParam.startsWith(`/store/${org}/`)) return redirectParam;
    return `/store/${org}/account`;
  }, [redirectParam, org]);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
  });

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth) {
      router.replace(redirect);
    }
  }, [redirect, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? `/store/${orgSlug}/login` : `/store/${orgSlug}/register`;

      const payload = isLogin
        ? { email: form.email.trim().toLowerCase() }
        : {
            email: form.email.trim().toLowerCase(),
            name: form.name.trim(),
            phone: form.phone.trim(),
          };

      const res = await fetch(`/api${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(err.detail || (isLogin ? "Login failed" : "Registration failed"));
      }

      const data = (await res.json()) as AuthResponse;

      const customer = "customer" in data ? data.customer : data;
      const token = "token" in data ? data.token : "";
      if (!token) throw new Error("Missing auth token");

      setStoredAuth({ customer, token });

      router.replace(redirect);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "An error occurred";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--c-accent)/0.12),transparent_45%)] px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface))] p-8 shadow-[var(--shadow-1)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--c-muted))]">
            Storefront Access
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[hsl(var(--c-text))]">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-3 text-sm text-[hsl(var(--c-muted-2))]">
            {isLogin
              ? "Sign in to track orders, save your details, and keep receipts organized."
              : "Register once to make future checkouts faster and keep all your orders in one place."}
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-[hsl(var(--c-danger))] bg-[hsl(var(--c-danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--c-danger))]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-[hsl(var(--c-muted-2))]">
                    Full Name
                  </label>
                  <Input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-[hsl(var(--c-muted-2))]">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+254..."
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[hsl(var(--c-muted-2))]">
                Email
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm font-medium text-[hsl(var(--c-accent))] hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface))] p-8 shadow-[var(--shadow-1)]">
          <h2 className="text-lg font-semibold text-[hsl(var(--c-text))]">Why create an account?</h2>
          <div className="mt-4 space-y-4 text-sm text-[hsl(var(--c-muted-2))]">
            <div className="rounded-2xl border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface-2))] p-4">
              Track order status in real time and revisit your receipts.
            </div>
            <div className="rounded-2xl border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface-2))] p-4">
              Save your delivery details for faster repeat purchases.
            </div>
            <div className="rounded-2xl border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface-2))] p-4">
              Keep everything in one place with a clean, private dashboard.
            </div>
          </div>
          <div className="mt-6">
            <a
              href={`/store/${org}`}
              className="inline-flex items-center text-sm font-medium text-[hsl(var(--c-muted))] hover:text-[hsl(var(--c-text))]"
            >
              &larr; Back to Store
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

