import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendUrl, cookieSecure } from "@/lib/env";

async function forward(req: Request, path: string, accessToken: string | undefined) {
  const url = new URL(req.url);
  const target = `${backendUrl()}/api/v1/${path}${url.search}`;

  const headers = new Headers(req.headers);
  headers.set("accept", "application/json");
  headers.delete("host");
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store"
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  return fetch(target, init);
}

async function refreshTokens(): Promise<{ access: string; refresh: string } | null> {
  const refresh = cookies().get("refresh_token")?.value;
  if (!refresh) return null;
  const res = await fetch(`${backendUrl()}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
    cache: "no-store"
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return null;
  return { access: data.access_token as string, refresh: data.refresh_token as string };
}

async function handler(req: Request, ctx: { params: { path: string[] } }) {
  const p = ctx.params.path.join("/");
  const access = cookies().get("access_token")?.value;

  let res = await forward(req, p, access);
  let refreshed: { access: string; refresh: string } | null = null;
  if (res.status === 401) {
    refreshed = await refreshTokens();
    if (refreshed) res = await forward(req, p, refreshed.access);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const contentDisposition = res.headers.get("content-disposition");

  let out: NextResponse;
  if (contentType.includes("application/json")) {
    const body = await res.json().catch(() => null);
    out = NextResponse.json(body, { status: res.status });
  } else {
    const buf = await res.arrayBuffer();
    out = new NextResponse(buf, { status: res.status });
    if (contentType) out.headers.set("content-type", contentType);
    if (contentDisposition) out.headers.set("content-disposition", contentDisposition);
  }
  if (refreshed) {
    out.cookies.set("access_token", refreshed.access, {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieSecure(),
      path: "/",
      maxAge: 60 * 15
    });
    out.cookies.set("refresh_token", refreshed.refresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieSecure(),
      path: "/",
      maxAge: 60 * 60 * 24 * 14
    });
  }
  return out;
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
