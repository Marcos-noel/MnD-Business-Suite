"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, LogIn, LogOut } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { QrScanner } from "@/components/hr/QrScanner";

type Employee = {
  id: string;
  employee_no: string;
  full_name: string;
  email: string;
  role_title: string;
  hire_date: string;
};

type TimeEntry = {
  id: string;
  day: string;
  clock_in_at: string;
  clock_out_at: string | null;
  source: string;
  note: string;
};

type LeaveRequest = {
  id: string;
  start_day: string;
  end_day: string;
  leave_type: string;
  reason: string;
  status: string;
  decision_note: string;
};

function fmtTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function extractToken(raw: string): string {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (value.split(".").length === 3) return value; // JWT-like
  const m = value.match(/token=([^&\s]+)/i);
  if (m) return decodeURIComponent(m[1]);
  return value;
}

export default function MyHrPage() {
  const [emp, setEmp] = useState<Employee | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [leaveForm, setLeaveForm] = useState({
    start_day: "",
    end_day: "",
    leave_type: "annual",
    reason: ""
  });

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [e, t, l] = await Promise.all([
        api<Employee>("hr/me"),
        api<TimeEntry[]>("hr/me/time-entries?limit=14"),
        api<LeaveRequest[]>("hr/me/leave?limit=20")
      ]);
      setEmp(e);
      setEntries(t);
      setLeaves(l);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = useMemo(() => entries.find((x) => x.day === today) ?? null, [entries, today]);

  async function clockIn() {
    try {
      setError(null);
      await api("hr/me/clock-in", { method: "POST", body: JSON.stringify({ source: "web" }) });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function clockOut() {
    try {
      setError(null);
      await api("hr/me/clock-out", { method: "POST", body: JSON.stringify({}) });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function clockByQr(raw: string) {
    try {
      setError(null);
      const token = extractToken(raw);
      if (!token) throw new Error("Invalid QR payload");
      await api("hr/me/clock/qr", { method: "POST", body: JSON.stringify({ token }) });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function requestLeave() {
    try {
      setError(null);
      await api("hr/me/leave", { method: "POST", body: JSON.stringify(leaveForm) });
      setLeaveForm({ start_day: "", end_day: "", leave_type: "annual", reason: "" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-lg font-semibold tracking-tight">My HR</div>
            <Badge variant="secondary">
              <Clock className="h-3.5 w-3.5" />
              Self-service
            </Badge>
          </div>
          <div className="mt-1 text-sm text-[hsl(var(--c-muted-2))]">Clock in/out, view time entries, and request leave.</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {error && <Card className="border border-red-500/30 bg-red-500/10 text-sm">{error}</Card>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Today</div>
              <div className="mt-1 text-xs text-[hsl(var(--c-muted-2))]">{today}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={clockIn} disabled={!!todayEntry || loading}>
                <LogIn className="h-4 w-4" />
                Clock in
              </Button>
              <Button variant="ghost" size="sm" onClick={clockOut} disabled={!todayEntry || !!todayEntry?.clock_out_at || loading}>
                <LogOut className="h-4 w-4" />
                Clock out
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setScannerOpen(true)} disabled={loading}>
                Scan QR
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[hsl(var(--c-border))] p-3">
              <div className="text-xs text-[hsl(var(--c-muted-2))]">Clock in</div>
              <div className="mt-1 text-sm font-semibold">{fmtTime(todayEntry?.clock_in_at ?? null)}</div>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--c-border))] p-3">
              <div className="text-xs text-[hsl(var(--c-muted-2))]">Clock out</div>
              <div className="mt-1 text-sm font-semibold">{fmtTime(todayEntry?.clock_out_at ?? null)}</div>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--c-border))] p-3">
              <div className="text-xs text-[hsl(var(--c-muted-2))]">Employee</div>
              <div className="mt-1 text-sm font-semibold">{emp ? emp.full_name : "—"}</div>
              <div className="mt-0.5 text-xs text-[hsl(var(--c-muted-2))]">{emp ? emp.employee_no : ""}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold">Request leave</div>
          <div className="mt-1 text-xs text-[hsl(var(--c-muted-2))]">Submit a request for manager approval.</div>
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={leaveForm.start_day} onChange={(e) => setLeaveForm({ ...leaveForm, start_day: e.target.value })} />
              <Input type="date" value={leaveForm.end_day} onChange={(e) => setLeaveForm({ ...leaveForm, end_day: e.target.value })} />
            </div>
            <Input
              placeholder="Type (annual/sick/unpaid)"
              value={leaveForm.leave_type}
              onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
            />
            <Input placeholder="Reason" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
            <Button onClick={requestLeave} disabled={!leaveForm.start_day || !leaveForm.end_day || loading}>
              Submit
            </Button>
          </div>
        </Card>
      </div>

      <QrScanner open={scannerOpen} title="Scan office clock QR" onClose={() => setScannerOpen(false)} onScan={clockByQr} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-0">
          <div className="px-4 py-3">
            <div className="text-sm font-semibold">Time entries</div>
            <div className="text-xs text-[hsl(var(--c-muted-2))]">Last 14 days</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[hsl(var(--c-muted-2))]">
                <tr>
                  <th className="px-4 py-3">Day</th>
                  <th className="px-4 py-3">In</th>
                  <th className="px-4 py-3">Out</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((t) => (
                  <tr key={t.id} className="border-t border-[hsl(var(--c-border))]">
                    <td className="px-4 py-3 font-medium">{t.day}</td>
                    <td className="px-4 py-3 text-[hsl(var(--c-muted))]">{fmtTime(t.clock_in_at)}</td>
                    <td className="px-4 py-3 text-[hsl(var(--c-muted))]">{fmtTime(t.clock_out_at)}</td>
                    <td className="px-4 py-3 text-[hsl(var(--c-muted-2))]">{t.source}</td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-[hsl(var(--c-muted-2))]" colSpan={4}>
                      No time entries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-0">
          <div className="px-4 py-3">
            <div className="text-sm font-semibold">Leave requests</div>
            <div className="text-xs text-[hsl(var(--c-muted-2))]">Your recent requests</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[hsl(var(--c-muted-2))]">
                <tr>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id} className="border-t border-[hsl(var(--c-border))]">
                    <td className="px-4 py-3 font-medium">
                      {l.start_day} → {l.end_day}
                      {l.reason ? <div className="mt-1 text-xs text-[hsl(var(--c-muted-2))]">{l.reason}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--c-muted))]">{l.leave_type}</td>
                    <td className="px-4 py-3">
                      <Badge variant={l.status === "approved" ? "accent" : l.status === "rejected" ? "danger" : "secondary"}>
                        {l.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-[hsl(var(--c-muted-2))]" colSpan={3}>
                      No leave requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
