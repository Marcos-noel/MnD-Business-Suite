import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendUrl, cookieSecure } from "@/lib/env";

export async function POST() {
  const refresh = cookies().get("refresh_token")?.value;
  if (!refresh) return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });

  const res = await fetch(`${backendUrl()}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
    cache: "no-store"
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return NextResponse.json(data ?? { error: "Refresh failed" }, { status: res.status });

  const out = NextResponse.json({ ok: true });
  out.cookies.set("access_token", data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    maxAge: 60 * 15
  });
  out.cookies.set("refresh_token", data.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
  return out;
}
