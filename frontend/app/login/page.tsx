"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

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

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (password.length < 10) {
          throw new Error("Password must be at least 10 characters");
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            org_name: orgName,
            org_slug: orgSlug.toLowerCase().replace(/\s+/g, "-"),
            admin_email: email,
            admin_full_name: fullName,
            admin_password: password,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          const msg = data?.error?.message ?? data?.error ?? "Registration failed";
          if (msg.includes("already exists") || msg.includes("unique")) {
            throw new Error("This company or email is already registered. Try a different slug or sign in.");
          }
          throw new Error(msg);
        }

        router.push(`/login?next=${encodeURIComponent(next)}`);
        setIsRegister(false);
        setPassword("");
        setConfirmPassword("");
        setError("Registration successful! Please sign in.");
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ org_slug: orgSlug, email, password }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error?.message ?? data?.error ?? "Login failed");
        }

        router.push(next as any);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error during login";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-white via-[#f8f8f8] to-[#f0f0f0]">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex items-center justify-center gap-3">
          <Logo />
          <div className="text-left">
            <div className="text-lg font-semibold text-black">{isRegister ? "Create your company" : "Secure SME workspace"}</div>
          </div>
        </div>

        <Card className="glass-card p-6">
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
                    <div className="mb-1 text-xs text-black/50">Company Name</div>
                    <Input 
                      value={orgName} 
                      onChange={(e) => setOrgName(e.target.value)} 
                      placeholder="My Company Ltd" 
                      required
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-black/50">Company Slug</div>
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
                    <div className="mb-1 text-xs text-black/50">Your Full Name</div>
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
                  <div className="mb-1 text-xs text-black/50">Organization slug</div>
                  <Input value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)} placeholder="my-company" autoComplete="off" />
                </div>
              )}
              <div>
                <div className="mb-1 text-xs text-black/50">Email</div>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" type="email" required autoComplete="off" />
              </div>
              <div>
                <div className="mb-1 text-xs text-black/50">{isRegister ? "Password" : "Password"}</div>
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
                  <div className="mb-1 text-xs text-black/50">Confirm Password</div>
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
              className="text-sm text-black/50 hover:text-black underline"
            >
              {isRegister ? "Already have an account? Sign in" : "Don't have a company? Register your organization"}
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
