"use client";

import { useState, useEffect, useCallback } from "react";

export type CustomerUser = {
  id: string;
  email: string;
  name: string;
  phone?: string;
};

export const STORAGE_KEY = "mnd-customer-auth";

export function getStoredAuth(): { customer: CustomerUser; token: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed?.customer && !parsed.customer.name && parsed.customer.full_name) {
      parsed.customer.name = parsed.customer.full_name;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: { customer: CustomerUser; token: string } | null) {
  if (typeof window === "undefined") return;
  if (auth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth) {
      setCustomer(auth.customer);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = useCallback((customerData: CustomerUser, token: string) => {
    setStoredAuth({ customer: customerData, token });
    setCustomer(customerData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setStoredAuth(null);
    setCustomer(null);
    setIsAuthenticated(false);
  }, []);

  const getToken = useCallback(() => {
    const auth = getStoredAuth();
    return auth?.token || null;
  }, []);

  return { isAuthenticated, customer, loading, login, logout, getToken };
}
