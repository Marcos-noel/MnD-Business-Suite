export function backendUrl() {
  // Support both NEXT_PUBLIC_BACKEND_URL and BACKEND_URL
  const url = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) {
    if (process.env.NODE_ENV !== "production") return "http://localhost:8000";
    throw new Error("Missing BACKEND_URL or NEXT_PUBLIC_BACKEND_URL");
  }
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function cookieSecure() {
  if (process.env.COOKIE_SECURE === "true") return true;
  return process.env.NODE_ENV === "production";
}
