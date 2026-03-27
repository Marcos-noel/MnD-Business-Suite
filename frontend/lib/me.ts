"use client";

import { api } from "@/lib/api";
import { useQuery } from "@/lib/query";

export type Me = {
  org_id: string;
  org_name: string;
  org_slug: string;
  org_logo_url: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  roles: string[];
  permissions: string[];
  enabled_modules: string[];
};

export function useMe() {
  return useQuery<Me>("me", () => api<Me>("auth/me"));
}

export function hasPermission(me: Me | null | undefined, permission: string) {
  return !!me?.permissions?.includes(permission);
}

export function hasAnyPermission(me: Me | null | undefined, permissions: string[]) {
  if (!me) return false;
  return permissions.some((p) => me.permissions.includes(p));
}

export function hasModule(me: Me | null | undefined, moduleCode: string) {
  if (!me) return false;
  return me.enabled_modules?.includes(moduleCode);
}
