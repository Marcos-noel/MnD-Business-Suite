import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/subscription",
  "/demo",
  "/contact",
  "/api/auth/login",
  "/api/auth/refresh",
  "/store"
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) =>
    p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(p)
  );
  if (isPublic) return NextResponse.next();

  const access = req.cookies.get("access_token")?.value;
  if (!access && !pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
