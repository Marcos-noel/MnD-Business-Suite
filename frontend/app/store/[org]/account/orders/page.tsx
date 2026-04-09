"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { AccountShell } from "@/app/store/[org]/account/_components/AccountShell";
import { Input } from "@/components/ui/Input";
import { getStoredAuth } from "@/lib/auth";

type Order = {
  id: string;
  order_no: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
  items: OrderItem[];
  customer_name: string;
  customer_email: string;
};

type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export default function AccountOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const org = params.org as string;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [customer, setCustomer] = useState<{ id: string; email: string; name: string; phone?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("recent");

  const loadOrders = useCallback(async () => {
    if (!customer) return;
    
    try {
      setLoading(true);
      const auth = getStoredAuth();
      if (!auth?.token) throw new Error("Not authenticated");
      const res = await fetch(`/api/store/${org}/orders?customer_id=${customer.id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Failed to load" }));
        throw new Error(err.detail || "Failed to load orders");
      }
      const data = await res.json();
      setOrders(data || []);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Failed to load orders";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [customer, org]);

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth?.token) {
      setCustomer(auth.customer);
      setIsAuthenticated(true);
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace(`/store/${org}/login?redirect=/store/${org}/account/orders`);
      return;
    }

    loadOrders();
  }, [isAuthenticated, authLoading, org, loadOrders, router]);

  useEffect(() => {
    if (!selectedOrder) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedOrder(null);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedOrder]);

  function formatDate(dateStr: string): string {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatMoney(amount: number, currency: string): string {
    if (!currency) return amount.toLocaleString();
    try {
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(amount || 0);
    } catch {
      return `${currency} ${amount?.toLocaleString() || 0}`;
    }
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      processing: "bg-purple-100 text-purple-700",
      shipped: "bg-indigo-100 text-indigo-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  }

  const statusOptions = useMemo(() => {
    const statuses = new Set<string>();
    orders.forEach(order => {
      if (order.status) statuses.add(order.status.toLowerCase());
    });
    return ["all", ...Array.from(statuses).sort()];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    let next = orders.filter(order => {
      if (statusFilter !== "all" && order.status?.toLowerCase() !== statusFilter) return false;
      if (!q) return true;
      const matchOrder = order.order_no?.toLowerCase().includes(q);
      const matchItems = order.items?.some(item => item.product_name?.toLowerCase().includes(q));
      return matchOrder || matchItems;
    });

    if (sort === "oldest") {
      next = next.slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sort === "total_high") {
      next = next.slice().sort((a, b) => (b.total || 0) - (a.total || 0));
    } else if (sort === "total_low") {
      next = next.slice().sort((a, b) => (a.total || 0) - (b.total || 0));
    } else {
      next = next.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return next;
  }, [orders, query, statusFilter, sort]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--c-bg))] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--c-accent))] mx-auto"></div>
          <p className="mt-4 text-[hsl(var(--c-muted))]">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <AccountShell
      org={org}
      title="Your Orders"
      subtitle="Track deliveries, revisit items, and keep receipts organized."
      active="orders"
    >
      <div className="rounded-3xl border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface))] p-6 shadow-[var(--shadow-1)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-[0.2em] text-[hsl(var(--c-muted-2))]">
                Search orders
              </label>
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Order number or product"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-[0.2em] text-[hsl(var(--c-muted-2))]">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="focus-ring hairline w-full rounded-2xl bg-[color-mix(in_oklab,hsl(var(--c-surface))_55%,transparent)] px-4 py-2 text-sm text-[hsl(var(--c-text))]"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status === "all" ? "All statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-[0.2em] text-[hsl(var(--c-muted-2))]">
                Sort by
              </label>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="focus-ring hairline w-full rounded-2xl bg-[color-mix(in_oklab,hsl(var(--c-surface))_55%,transparent)] px-4 py-2 text-sm text-[hsl(var(--c-text))]"
              >
                <option value="recent">Most recent</option>
                <option value="oldest">Oldest</option>
                <option value="total_high">Highest total</option>
                <option value="total_low">Lowest total</option>
              </select>
            </div>
          </div>
          <div className="text-xs text-[hsl(var(--c-muted-2))]">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-[hsl(var(--c-danger))] bg-[hsl(var(--c-danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--c-danger))]">
            {error}
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface-2))] p-10 text-center">
            <p className="text-sm text-[hsl(var(--c-muted))]">
              {orders.length === 0
                ? "You have not placed any orders yet."
                : "No orders match your filters."}
            </p>
            <button
              onClick={() => router.push(`/store/${org}`)}
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-[hsl(var(--c-accent))] px-4 py-2 text-sm font-medium text-white"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="rounded-3xl border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface-2))] shadow-[var(--shadow-1)]">
                <div className="flex flex-col gap-4 border-b border-[hsl(var(--c-border))] p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <span className="font-mono text-sm font-semibold tracking-wide text-[hsl(var(--c-text))]">
                      {order.order_no}
                    </span>
                    <span className="ml-3 text-xs text-[hsl(var(--c-muted-2))]">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status?.charAt(0).toUpperCase() || ""}
                      {order.status?.slice(1) || "Unknown"}
                    </span>
                    <span className="text-sm font-semibold text-[hsl(var(--c-text))]">
                      {formatMoney(order.total || 0, order.currency)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-[hsl(var(--c-text))]">
                        {order.items?.length || 0} item(s)
                      </h3>
                      <p className="mt-1 text-xs text-[hsl(var(--c-muted-2))]">
                        {order.items?.slice(0, 2).map(i => i.product_name).join(", ")}
                        {order.items?.length > 2 && ` +${order.items.length - 2} more`}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-sm font-medium text-[hsl(var(--c-accent))] hover:underline"
                    >
                      View details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-2xl rounded-3xl bg-[hsl(var(--c-surface))] shadow-[var(--shadow-pop)]"
            onClick={event => event.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[hsl(var(--c-text))]">
                    Order {selectedOrder.order_no}
                  </h2>
                  <p className="text-sm text-[hsl(var(--c-muted-2))]">
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full p-1 text-[hsl(var(--c-muted))] hover:text-[hsl(var(--c-text))]"
                  aria-label="Close order details"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status?.charAt(0).toUpperCase() || ""}
                  {selectedOrder.status?.slice(1) || "Unknown"}
                </span>
              </div>

              <div className="mt-6 border-t border-[hsl(var(--c-border))] pt-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[hsl(var(--c-muted-2))]">
                  Items
                </h3>
                <div className="mt-3 space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--c-text))]">{item.product_name}</p>
                        <p className="text-xs text-[hsl(var(--c-muted-2))]">x {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-[hsl(var(--c-text))]">
                        {formatMoney(item.line_total || 0, selectedOrder.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-[hsl(var(--c-border))] pt-4">
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatMoney(selectedOrder.total || 0, selectedOrder.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AccountShell>
  );
}

