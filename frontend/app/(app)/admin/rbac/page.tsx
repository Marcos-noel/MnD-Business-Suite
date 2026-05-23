"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

type Role = { id: string; name: string; description: string };
type Permission = { code: string; description: string };
type RolePermMap = { role_id: string; permission_codes: string[] };

export default function AdminRbacPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedRole = useMemo(() => roles.find((r) => r.id === selectedRoleId) ?? null, [roles, selectedRoleId]);

  async function load() {
    try {
      setError(null);
      const [r, p] = await Promise.all([api<Role[]>("rbac/roles"), api<Permission[]>("rbac/permissions")]);
      setRoles(r);
      setPermissions(p);
      if (!selectedRoleId && r.length > 0) setSelectedRoleId(r[0].id);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function loadRolePermissions(roleId: string) {
    try {
      const data = await api<RolePermMap>(`rbac/roles/${roleId}/permissions`);
      setSelectedCodes(new Set(data.permission_codes));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) return;
    void loadRolePermissions(selectedRoleId);
  }, [selectedRoleId]);

  async function createRole() {
    try {
      setBusy(true);
      setError(null);
      await api("rbac/roles", { method: "POST", body: JSON.stringify(newRole) });
      setNewRole({ name: "", description: "" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function grant(code: string) {
    if (!selectedRoleId) return;
    try {
      setBusy(true);
      setError(null);
      await api("rbac/grant", { method: "POST", body: JSON.stringify({ role_id: selectedRoleId, permission_code: code }) });
      setSelectedCodes((prev) => new Set(prev).add(code));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">RBAC Management</h1>
        <p className="text-sm text-[hsl(var(--c-muted-2))]">Create roles and grant module permissions including CRM quote/social/activity rights.</p>
      </div>

      {error && <Card className="border border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input placeholder="Role name" value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} />
          <Input placeholder="Description" value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} />
          <Button disabled={busy || !newRole.name.trim()} onClick={createRole}>Create Role</Button>
        </div>
      </Card>

      <Card>
        <div className="mb-3 text-sm font-medium">Roles</div>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <Button key={r.id} variant={selectedRoleId === r.id ? "primary" : "ghost"} onClick={() => setSelectedRoleId(r.id)}>
              {r.name}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 text-sm font-medium">
          Permissions {selectedRole ? `for ${selectedRole.name}` : ""}
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {permissions.map((p) => {
            const has = selectedCodes.has(p.code);
            return (
              <div key={p.code} className="flex items-center justify-between rounded-lg border border-white/10 p-2">
                <div>
                  <div className="text-sm">{p.code}</div>
                  <div className="text-xs text-[hsl(var(--c-muted-2))]">{p.description}</div>
                </div>
                <Button disabled={busy || has || !selectedRoleId} onClick={() => grant(p.code)}>
                  {has ? "Granted" : "Grant"}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
