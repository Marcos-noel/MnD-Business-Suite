"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AccountShell } from "@/app/store/[org]/account/_components/AccountShell";
import { CustomerUser, getStoredAuth, setStoredAuth } from "@/lib/auth";

export default function AccountProfilePage() {
  const params = useParams();
  const router = useRouter();
  const org = params.org as string;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth?.token) {
      setCustomer(auth.customer);
      setIsAuthenticated(true);
      setForm({
        name: auth.customer.name,
        phone: auth.customer.phone || "",
      });
    } else {
      router.replace(`/store/${org}/login?redirect=/store/${org}/account/profile`);
    }
    setLoading(false);
  }, [org, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const auth = getStoredAuth();
      if (!auth?.token) throw new Error("Not authenticated");

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
      };

      const res = await fetch(`/api/store/${org}/account?customer_id=${auth.customer.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Update failed" }));
        throw new Error(err.detail || "Update failed");
      }

      const updated = await res.json();
      const newAuth = { ...auth, customer: { ...auth.customer, ...updated } };
      setStoredAuth(newAuth);
      setCustomer(newAuth.customer);
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Failed to update profile";
      setError(errMsg);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    setStoredAuth(null);
    router.push(`/store/${org}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !customer) {
    return null;
  }

  const initials = useMemo(() => {
    if (!customer?.name) return "";
    return customer.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join("");
  }, [customer?.name]);

  const isDirty =
    customer?.name !== form.name.trim() || (customer?.phone || "") !== form.phone.trim();

  return (
    <AccountShell
      org={org}
      title="Profile & Preferences"
      subtitle="Keep your details up to date so checkout is faster next time."
      active="profile"
    >
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface))] p-6 shadow-[var(--shadow-1)]">
          {error && (
            <div className="mb-4 rounded-2xl border border-[hsl(var(--c-danger))] bg-[hsl(var(--c-danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--c-danger))]">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-2xl border border-[hsl(var(--c-accent-4))] bg-[hsl(var(--c-accent-4)/0.08)] px-4 py-3 text-sm text-[hsl(var(--c-accent-4))]">
              {success}
            </div>
          )}

          {!editing ? (
            <>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--c-accent)/0.12)] text-lg font-semibold text-[hsl(var(--c-accent))]">
                  {initials || "U"}
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--c-muted-2))]">Signed in as</p>
                  <p className="text-lg font-semibold">{customer.name}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface-2))] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--c-muted-2))]">
                    Email
                  </p>
                  <p className="mt-2 text-sm font-medium">{customer.email}</p>
                </div>
                <div className="rounded-2xl border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface-2))] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--c-muted-2))]">
                    Phone
                  </p>
                  <p className="mt-2 text-sm font-medium">{customer.phone || "Not set"}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                <Button variant="secondary" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-[hsl(var(--c-muted-2))]">
                  Full Name
                </label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
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
              <div className="flex flex-wrap gap-3 pt-4">
                <Button type="submit" disabled={saving || !isDirty}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      name: customer.name,
                      phone: customer.phone || "",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="rounded-3xl border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface))] p-6 shadow-[var(--shadow-1)]">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[hsl(var(--c-muted))]">
            Quick Actions
          </h3>
          <div className="mt-4 space-y-3">
            <a
              href={`/store/${org}/account/orders`}
              className="flex items-center justify-between rounded-2xl border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface-2))] px-4 py-3 text-sm transition hover:shadow-[var(--shadow-2)]"
            >
              <span className="font-medium">View order history</span>
              <span className="text-xs text-[hsl(var(--c-muted-2))]">Track deliveries</span>
            </a>
            <div className="rounded-2xl border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface-2))] px-4 py-3 text-sm text-[hsl(var(--c-muted-2))]">
              We only use your details to personalize checkout and order updates.
            </div>
          </div>
        </div>
      </div>
    </AccountShell>
  );
}
