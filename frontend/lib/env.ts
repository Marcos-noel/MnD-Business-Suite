export function backendUrl() {
  // Support both NEXT_PUBLIC_BACKEND_URL and BACKEND_URL
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_BACKEND_URL or BACKEND_URL");
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function cookieSecure() {
  if (process.env.COOKIE_SECURE === "true") return true;
  return process.env.NODE_ENV === "production";
}
