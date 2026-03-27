export function backendUrl() {
  const url = process.env.BACKEND_URL;
  if (!url) throw new Error("Missing BACKEND_URL");
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function cookieSecure() {
  if (process.env.COOKIE_SECURE === "true") return true;
  return process.env.NODE_ENV === "production";
}
