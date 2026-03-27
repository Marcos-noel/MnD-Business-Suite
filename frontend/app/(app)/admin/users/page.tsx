"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

type User = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
};

export default function UsersAdminPage() {
  const [items, setItems] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    password: "",
    role_name: "staff",
    is_active: true
  });

  async function load() {
    try {
      setError(null);
      const data = await api<User[]>("auth/users");
      setItems(data);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function create() {
    try {
      setError(null);
      await api("auth/users", { method: "POST", body: JSON.stringify(form) });
      setForm({ email: "", full_name: "", password: "", role_name: "staff", is_active: true });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("Clipboard copy failed");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold tracking-tight">Users</div>
        <div className="text-sm text-[hsl(var(--c-muted-2))]">Create accounts and use the user id to link employees.</div>
      </div>

      {error && <Card className="border border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input placeholder="Role (admin/staff/...)" value={form.role_name} onChange={(e) => setForm({ ...form, role_name: e.target.value })} />
          <Button onClick={create} disabled={!form.email || !form.full_name || !form.password}>
            Add
          </Button>
        </div>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[hsl(var(--c-muted-2))]">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-t border-[hsl(var(--c-border))]">
                  <td className="px-4 py-3 font-medium">{u.full_name}</td>
                  <td className="px-4 py-3 text-[hsl(var(--c-muted))]">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="rounded-lg bg-black/10 px-2 py-1 text-xs">{u.id}</code>
                      <IconButton aria-label="Copy user id" size="sm" onClick={() => copy(u.id)}>
                        <Copy className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--c-muted))]">{u.is_active ? "Yes" : "No"}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-[hsl(var(--c-muted-2))]" colSpan={4}>
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

