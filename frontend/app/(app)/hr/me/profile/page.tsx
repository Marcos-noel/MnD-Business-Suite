"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/lib/me";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Camera, Save, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { data: me, refetch } = useMe();
  const [fullName, setFullName] = useState(me?.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(me?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api("auth/me", {
        method: "PATCH",
        body: JSON.stringify({ full_name: fullName, avatar_url: avatarUrl }),
      });
      setMessage({ type: "success", text: "Profile updated successfully" });
      refetch();
    } catch (err) {
      setMessage({ type: "error", text: String(err) });
    } finally {
      setSaving(false);
    }
  }

  if (!me) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl py-8">
      <h1 className="mb-6 text-2xl font-semibold">Profile Settings</h1>
      
      <Card className="p-6">
        <form onSubmit={onSave} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-surface-2">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl font-semibold text-muted">
                    {me.full_name?.charAt(0) ?? "U"}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-accent text-white shadow-md hover:bg-accent-hover">
                <Camera className="h-4 w-4" />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>
            <Input
              placeholder="Avatar image URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full max-w-xs text-center"
            />
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input value={me.email} disabled className="bg-surface-2" />
              <p className="mt-1 text-xs text-muted">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium">Full Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Organization</label>
              <Input value={me.org_name} disabled className="bg-surface-2" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Roles</label>
              <Input value={me.roles.join(", ")} disabled className="bg-surface-2" />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`rounded-md p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>

      {/* Preferences Section */}
      <h2 className="mb-4 mt-8 text-xl font-semibold">Preferences</h2>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Dark Mode</div>
              <div className="text-sm text-muted">Use dark theme throughout the app</div>
            </div>
            <button
              onClick={() => {
                const current = document.documentElement.dataset.theme;
                document.documentElement.dataset.theme = current === "dark" ? "light" : "dark";
                localStorage.setItem("theme", current === "dark" ? "light" : "dark");
              }}
              className="relative h-6 w-11 rounded-full bg-surface-2 transition-colors"
            >
              <span className="sr-only">Toggle dark mode</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <div className="font-medium">Compact Sidebar</div>
              <div className="text-sm text-muted">Show icons only in the sidebar</div>
            </div>
            <button className="relative h-6 w-11 rounded-full bg-surface-2 transition-colors">
              <span className="sr-only">Toggle compact sidebar</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
