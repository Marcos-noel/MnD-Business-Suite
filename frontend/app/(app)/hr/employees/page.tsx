"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

type Employee = {
  id: string;
  employee_no: string;
  full_name: string;
  role_title: string;
  email: string;
  hire_date: string;
  is_active: boolean;
};

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    employee_no: "",
    full_name: "",
    email: "",
    role_title: "",
    hire_date: ""
  });
  const [linkForm, setLinkForm] = useState({ employee_id: "", user_id: "" });

  async function load() {
    try {
      setError(null);
      const data = await api<Employee[]>("hr/employees");
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
      await api("hr/employees", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          hire_date: form.hire_date || new Date().toISOString().slice(0, 10)
        })
      });
      setForm({ employee_no: "", full_name: "", email: "", role_title: "", hire_date: "" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function linkUser() {
    try {
      setError(null);
      await api(`hr/employees/${linkForm.employee_id}/link-user`, {
        method: "POST",
        body: JSON.stringify({ user_id: linkForm.user_id })
      });
      setLinkForm({ employee_id: "", user_id: "" });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">Employees</div>
          <div className="text-sm text-[hsl(var(--c-muted-2))]">Manage employees and link them to user accounts.</div>
        </div>
      </div>

      {error && <Card className="border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <Input placeholder="Employee no" value={form.employee_no} onChange={(e) => setForm({ ...form, employee_no: e.target.value })} />
          <Input placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Role title" value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} />
          <div className="flex gap-2">
            <Input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} />
            <Button onClick={create}>Add</Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold">Link employee to user</div>
        <div className="mt-1 text-xs text-[hsl(var(--c-muted-2))]">
          Create users in <span className="font-medium">Admin → Users</span>, then link the employee to the user id.
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input placeholder="Employee ID" value={linkForm.employee_id} onChange={(e) => setLinkForm({ ...linkForm, employee_id: e.target.value })} />
          <Input placeholder="User ID" value={linkForm.user_id} onChange={(e) => setLinkForm({ ...linkForm, user_id: e.target.value })} />
          <Button onClick={linkUser} disabled={!linkForm.employee_id || !linkForm.user_id}>
            Link
          </Button>
        </div>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[hsl(var(--c-muted-2))]">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Hire date</th>
                <th className="px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-t border-[hsl(var(--c-border))]">
                  <td className="px-4 py-3 font-medium">{e.employee_no}</td>
                  <td className="px-4 py-3">{e.full_name}</td>
                  <td className="px-4 py-3 text-[hsl(var(--c-muted))]">{e.role_title}</td>
                  <td className="px-4 py-3 text-[hsl(var(--c-muted))]">{e.email}</td>
                  <td className="px-4 py-3 text-[hsl(var(--c-muted))]">{e.hire_date}</td>
                  <td className="px-4 py-3">{e.is_active ? "Yes" : "No"}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-[hsl(var(--c-muted-2))]" colSpan={6}>
                    No employees yet.
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
