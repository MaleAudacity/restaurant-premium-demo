import { NextRequest, NextResponse } from "next/server";
import { type UserRole, ROLE_ALLOWED_PREFIXES, ROLE_HOME } from "@/lib/constants";

export const DEMO_ROLE_COOKIE = "mirch-masala-demo-role";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/orders",
  "/bookings",
  "/events",
  "/kitchen",
  "/delivery",
  "/analytics",
  "/menu-images",
  "/menu-management",
  "/settings",
  "/demo",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isAllowed(role: UserRole, pathname: string): boolean {
  const allowed = ROLE_ALLOWED_PREFIXES[role];
  return allowed.some((p) => p === "/" || pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtected(pathname)) return NextResponse.next();

  const role = request.cookies.get(DEMO_ROLE_COOKIE)?.value as UserRole | undefined;

  if (!role || !(role in ROLE_ALLOWED_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!isAllowed(role, pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_HOME[role];
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)" ],
};
