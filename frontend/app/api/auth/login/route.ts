import { NextResponse } from "next/server";
import { backendUrl, cookieSecure } from "@/lib/env";
import { fetchBackend } from "@/lib/backend-fetch";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const orgSlug = typeof body.org_slug === "string" ? body.org_slug.trim().toLowerCase() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!orgSlug || !email || !password) {
      return NextResponse.json({ error: "org_slug, email, and password are required" }, { status: 400 });
    }

    const payload = { org_slug: orgSlug, email, password };

    const doLogin = () =>
      fetchBackend(
        `${backendUrl()}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        25000
      );

    let res: Response;
    try {
      res = await doLogin();
    } catch (error) {
      const isTimeout = error instanceof Error && error.message.includes("timed out");
      if (!isTimeout) throw error;
      // Retry once to absorb cold-start or transient upstream latency.
      res = await doLogin();
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(data ?? { error: "Login failed" }, { status: res.status });
    }
    if (!data?.access_token || !data?.refresh_token) {
      return NextResponse.json({ error: "Invalid login response from backend" }, { status: 502 });
    }

    const out = NextResponse.json({ ok: true });
    out.cookies.set("access_token", data.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieSecure(),
      path: "/",
      maxAge: 60 * 15,
    });
    out.cookies.set("refresh_token", data.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieSecure(),
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
    out.cookies.set("org_slug", body.org_slug ?? "", {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieSecure(),
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
    return out;
  } catch (error) {
    const isTimeout = error instanceof Error && error.message.includes("timed out");
    return NextResponse.json({ error: isTimeout ? "Backend request timed out" : "Login error" }, { status: isTimeout ? 504 : 502 });
  }
}

