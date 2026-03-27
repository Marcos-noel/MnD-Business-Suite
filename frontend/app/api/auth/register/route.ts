import { NextResponse } from "next/server";
import { backendUrl, cookieSecure } from "@/lib/env";

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${backendUrl()}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) return NextResponse.json(data ?? { error: "Registration failed" }, { status: res.status });

  return NextResponse.json(data);
}
