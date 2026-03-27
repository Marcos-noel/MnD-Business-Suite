"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = useMemo(() => sp.get("next") ?? "/dashboard", [sp]);
  const [isRegister, setIsRegister] = useState(false);
  const [orgSlug, setOrgSlug] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (isRegister) {
      // Registration
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      if (password.length < 10) {
        setError("Password must be at least 10 characters");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          org_name: orgName, 
          org_slug: orgSlug.toLowerCase().replace(/\s+/g, '-'),
          admin_email: email,
          admin_full_name: fullName,
          admin_password: password
        })
      });
      setLoading(false);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.error?.message ?? data?.error ?? "Registration failed";
        // Handle specific errors
        if (msg.includes("already exists") || msg.includes("unique")) {
          setError("This company or email is already registered. Try a different slug or sign in.");
        } else {
          setError(msg);
        }
        return;
      }
      // After registration, log them in
      router.push(`/login?next=${encodeURIComponent(next)}`);
      setIsRegister(false);
      setPassword("");
      setConfirmPassword("");
      setError("Registration successful! Please sign in.");
    } else {
      // Login
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_slug: orgSlug, email, password })
      });
      setLoading(false);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? data?.error ?? "Login failed");
        return;
      }
      router.push(next as any);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="hairline flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[color-mix(in_oklab,hsl(var(--c-surface))_60%,transparent)]">
            <img src="/brand/mnd-symbol.svg" alt="MnD" className="h-9 w-9" />
          </div>
          <div className="text-left">
            <div className="text-lg font-semibold">MnD Business Suite</div>
            <div className="text-sm text-[hsl(var(--c-muted-2))]">{isRegister ? "Create your company" : "Secure SME workspace"}</div>
          </div>
        </div>

        <Card className="p-6">
          <AnimatePresence mode="wait">
            <motion.form
              key={isRegister ? "register" : "login"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              onSubmit={onSubmit} 
              className="space-y-3"
            >
              {isRegister && (
                <>
                  <div>
                    <div className="mb-1 text-xs text-[hsl(var(--c-muted-2))]">Company Name</div>
                    <Input 
                      value={orgName} 
                      onChange={(e) => setOrgName(e.target.value)} 
                      placeholder="My Company Ltd" 
                      required
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[hsl(var(--c-muted-2))]">Company Slug</div>
                    <Input 
                      value={orgSlug} 
                      onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} 
                      placeholder="my-company"
                      title="Lowercase letters, numbers, and hyphens only"
                      required
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[hsl(var(--c-muted-2))]">Your Full Name</div>
                    <Input 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                      placeholder="John Doe" 
                      required
                      autoComplete="off"
                    />
                  </div>
                </>
              )}
              {!isRegister && (
                <div>
                  <div className="mb-1 text-xs text-[hsl(var(--c-muted-2))]">Organization slug</div>
                  <Input value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)} placeholder="my-company" autoComplete="off" />
                </div>
              )}
              <div>
                <div className="mb-1 text-xs text-[hsl(var(--c-muted-2))]">Email</div>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" type="email" required autoComplete="off" />
              </div>
              <div>
                <div className="mb-1 text-xs text-[hsl(var(--c-muted-2))]">{isRegister ? "Password" : "Password"}</div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={isRegister ? 10 : 1}
                  autoComplete="off"
                />
              </div>
              {isRegister && (
                <div>
                  <div className="mb-1 text-xs text-[hsl(var(--c-muted-2))]">Confirm Password</div>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={10}
                    autoComplete="off"
                  />
                </div>
              )}
              {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (isRegister ? "Creating account..." : "Signing in...") : (isRegister ? "Create Company" : "Sign in")}
              </Button>
            </motion.form>
          </AnimatePresence>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-sm text-[hsl(var(--c-muted-2))] hover:text-[hsl(var(--c-text))] underline"
            >
              {isRegister ? "Already have an account? Sign in" : "Don't have a company? Register your organization"}
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

