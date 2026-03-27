import { NextResponse } from "next/server";

export async function POST() {
  const out = NextResponse.json({ ok: true });
  out.cookies.set("access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  out.cookies.set("refresh_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  out.cookies.set("org_slug", "", { httpOnly: true, path: "/", maxAge: 0 });
  return out;
}

