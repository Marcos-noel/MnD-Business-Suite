"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

type Promotion = {
  id: string;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export default function PromotionsPage() {
  const [items, setItems] = useState<Promotion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 0,
    min_order_amount: 0,
    max_uses: null as number | null,
    starts_at: new Date().toISOString().split("T")[0],
    expires_at: "",
    is_active: true,
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    
    if (!form.code.trim()) {
      errors.code = "Promo code is required";
    } else if (!/^[A-Z0-9]+$/.test(form.code.toUpperCase())) {
      errors.code = "Code can only contain letters and numbers";
    }
    
    if (form.discount_type === "percentage" && (form.discount_value < 0 || form.discount_value > 100)) {
      errors.discount_value = "Percentage must be between 0 and 100";
    }
    
    if (form.discount_type === "fixed" && form.discount_value < 0) {
      errors.discount_value = "Discount value cannot be negative";
    }
    
    if (form.min_order_amount < 0) {
      errors.min_order_amount = "Minimum order cannot be negative";
    }
    
    if (form.max_uses !== null && form.max_uses < 1) {
      errors.max_uses = "Maximum uses must be at least 1";
    }
    
    if (!form.starts_at) {
      errors.starts_at = "Start date is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function clearFieldError(field: string) {
    const newErrors = { ...validationErrors };
    delete newErrors[field];
    setValidationErrors(newErrors);
  }

  async function load() {
    try {
      setError(null);
      setLoading(true);
      const data = await api<Promotion[]>("commerce/promotions");
      setItems(data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load promotions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    const today = new Date().toISOString().split("T")[0];
    setForm({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 10,
      min_order_amount: 0,
      max_uses: null,
      starts_at: today,
      expires_at: "",
      is_active: true,
    });
    setValidationErrors({});
    setShowModal(true);
  }

  function openEdit(item: Promotion) {
    setEditingId(item.id);
    setForm({
      code: item.code,
      description: item.description,
      discount_type: item.discount_type,
      discount_value: item.discount_value,
      min_order_amount: item.min_order_amount,
      max_uses: item.max_uses,
      starts_at: item.starts_at.split("T")[0],
      expires_at: item.expires_at ? item.expires_at.split("T")[0] : "",
      is_active: item.is_active,
    });
    setValidationErrors({});
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        ...form,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount),
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        expires_at: form.expires_at || null,
      };
      
      if (editingId) {
        const updated = await api<Promotion>(`commerce/promotions/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setItems(items.map(i => i.id === editingId ? updated : i));
      } else {
        const created = await api<Promotion>("commerce/promotions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setItems([...items, created]);
      }
      setShowModal(false);
    } catch (e: any) {
      setError(e.message || "Failed to save promotion");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await api(`commerce/promotions/${id}`, { method: "DELETE" });
      setItems(items.filter(i => i.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete promotion");
    }
  }

  async function toggleActive(item: Promotion) {
    try {
      const updated = await api<Promotion>(`commerce/promotions/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      setItems(items.map(i => i.id === item.id ? updated : i));
    } catch (e: any) {
      setError(e.message || "Failed to update promotion");
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "No expiration";
    return new Date(dateStr).toLocaleDateString();
  }

  function isExpired(item: Promotion): boolean {
    if (!item.expires_at) return false;
    return new Date(item.expires_at) < new Date();
  }

  function isNotStarted(item: Promotion): boolean {
    return new Date(item.starts_at) > new Date();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Promotions & Discounts</h1>
          <p className="text-gray-600 mt-1">Manage discount codes and promotional offers</p>
        </div>
        <Button onClick={openCreate}>+ Create Promotion</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No promotions yet</p>
          <Button onClick={openCreate}>Create First Promotion</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map(promo => (
            <Card key={promo.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg bg-blue-100 text-blue-700 px-3 py-1 rounded">
                      {promo.code}
                    </span>
                    {promo.discount_type === "percentage" ? (
                      <span className="font-semibold">{promo.discount_value}% OFF</span>
                    ) : (
                      <span className="font-semibold">KES {promo.discount_value} OFF</span>
                    )}
                    {isExpired(promo) && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Expired</span>
                    )}
                    {isNotStarted(promo) && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Scheduled</span>
                    )}
                    {!promo.is_active && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Inactive</span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{promo.description || "No description"}</p>
                  <div className="text-sm text-gray-500 mt-2 flex gap-4">
                    <span>Min order: KES {promo.min_order_amount.toLocaleString()}</span>
                    <span>Uses: {promo.used_count}{promo.max_uses ? ` / ${promo.max_uses}` : " (unlimited)"}</span>
                    <span>Valid: {formatDate(promo.starts_at)} - {formatDate(promo.expires_at)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(promo)}
                    className={`px-3 py-1 text-sm rounded ${
                      promo.is_active 
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {promo.is_active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => openEdit(promo)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Promotion" : "New Promotion"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Promo Code *</label>
                <Input
                  value={form.code}
                  onChange={e => {
                    setForm({ ...form, code: e.target.value.toUpperCase() });
                    clearFieldError("code");
                  }}
                  placeholder="e.g., SUMMER20"
                  className={validationErrors.code ? "border-red-500" : ""}
                />
                {validationErrors.code && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.code}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What's this promotion for?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={e => setForm({ ...form, discount_type: e.target.value as "percentage" | "fixed" })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (KES)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Value</label>
                  <Input
                    type="number"
                    value={form.discount_value}
                    onChange={e => {
                      setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 });
                      clearFieldError("discount_value");
                    }}
                    min={0}
                    className={validationErrors.discount_value ? "border-red-500" : ""}
                  />
                  {validationErrors.discount_value && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.discount_value}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Order (KES)</label>
                  <Input
                    type="number"
                    value={form.min_order_amount}
                    onChange={e => {
                      setForm({ ...form, min_order_amount: parseFloat(e.target.value) || 0 });
                      clearFieldError("min_order_amount");
                    }}
                    min={0}
                    className={validationErrors.min_order_amount ? "border-red-500" : ""}
                  />
                  {validationErrors.min_order_amount && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.min_order_amount}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Uses</label>
                  <Input
                    type="number"
                    value={form.max_uses ?? ""}
                    onChange={e => {
                      setForm({ ...form, max_uses: e.target.value ? parseInt(e.target.value) : null });
                      clearFieldError("max_uses");
                    }}
                    placeholder="Unlimited"
                    min={1}
                    className={validationErrors.max_uses ? "border-red-500" : ""}
                  />
                  {validationErrors.max_uses && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.max_uses}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <Input
                    type="date"
                    value={form.starts_at}
                    onChange={e => {
                      setForm({ ...form, starts_at: e.target.value });
                      clearFieldError("starts_at");
                    }}
                    className={validationErrors.starts_at ? "border-red-500" : ""}
                  />
                  {validationErrors.starts_at && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.starts_at}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <Input
                    type="date"
                    value={form.expires_at}
                    onChange={e => setForm({ ...form, expires_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="is_active" className="text-sm">Active (available for use)</label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingId ? "Update" : "Create"}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
