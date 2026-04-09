"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
};

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    parent_id: null as string | null,
    is_active: true,
    sort_order: 0,
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) {
      errors.name = "Category name is required";
    } else if (form.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (form.name.length > 100) {
      errors.name = "Name must be 100 characters or less";
    }
    
    if (!form.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function clearFieldError(field: string) {
    const newErrors = { ...validationErrors };
    delete newErrors[field];
    setValidationErrors(newErrors);
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  async function load() {
    try {
      setError(null);
      setLoading(true);
      const data = await api<Category[]>("inventory/categories");
      setItems(data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      image_url: "",
      parent_id: null,
      is_active: true,
      sort_order: items.length,
    });
    setValidationErrors({});
    setShowModal(true);
  }

  function openEdit(item: Category) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description,
      image_url: item.image_url,
      parent_id: item.parent_id,
      is_active: item.is_active,
      sort_order: item.sort_order,
    });
    setValidationErrors({});
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = { ...form, sort_order: Number(form.sort_order) };
      
      if (editingId) {
        const updated = await api<Category>(`inventory/categories/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setItems(items.map(i => i.id === editingId ? updated : i));
      } else {
        const created = await api<Category>("inventory/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setItems([...items, created]);
      }
      setShowModal(false);
    } catch (e: any) {
      setError(e.message || "Failed to save category");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api(`inventory/categories/${id}`, { method: "DELETE" });
      setItems(items.filter(i => i.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete category");
    }
  }

  async function toggleActive(item: Category) {
    try {
      const updated = await api<Category>(`inventory/categories/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      setItems(items.map(i => i.id === item.id ? updated : i));
    } catch (e: any) {
      setError(e.message || "Failed to update category");
    }
  }

  // Build parent options (exclude self and descendants)
  function getParentOptions(currentId?: string): Category[] {
    return items.filter(i => !currentId || i.id !== currentId);
  }

  // Group by parent for display
  const rootCategories = items.filter(i => !i.parent_id);
  const getChildren = (parentId: string) => items.filter(i => i.parent_id === parentId);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Product Categories</h1>
          <p className="text-gray-600 mt-1">Organize your products into categories</p>
        </div>
        <Button onClick={openCreate}>+ Add Category</Button>
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
          <p className="text-gray-500 mb-4">No categories yet</p>
          <Button onClick={openCreate}>Create First Category</Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rootCategories.map(category => (
                <>
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{category.sort_order}</td>
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {category.parent_id && <span className="text-gray-400">↳</span>}
                        {category.image_url && (
                          <img src={category.image_url} alt="" className="w-8 h-8 object-cover rounded" />
                        )}
                        {category.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-sm">{category.slug}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(category)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          category.is_active 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(category)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {getChildren(category.id).map(child => (
                    <tr key={child.id} className="hover:bg-gray-50 bg-gray-25">
                      <td className="px-4 py-3 text-gray-400">{child.sort_order}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">↳</span>
                          {child.image_url && (
                            <img src={child.image_url} alt="" className="w-8 h-8 object-cover rounded" />
                          )}
                          {child.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-sm">{child.slug}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(child)}
                          className={`px-2 py-1 text-xs rounded-full ${
                            child.is_active 
                              ? "bg-green-100 text-green-700" 
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {child.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEdit(child)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(child.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Category" : "New Category"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input
                  value={form.name}
                  onChange={e => {
                    setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) });
                    clearFieldError("name");
                  }}
                  placeholder="Category name"
                  className={validationErrors.name ? "border-red-500" : ""}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <Input
                  value={form.slug}
                  onChange={e => {
                    setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") });
                    clearFieldError("slug");
                  }}
                  placeholder="category-slug"
                  className={validationErrors.slug ? "border-red-500" : ""}
                />
                {validationErrors.slug && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.slug}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">URL-friendly identifier</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Category description"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <Input
                  value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Parent Category</label>
                <select
                  value={form.parent_id || ""}
                  onChange={e => setForm({ ...form, parent_id: e.target.value || null })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None (Root Category)</option>
                  {getParentOptions(editingId || undefined).map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={e => setForm({ ...form, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
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
