import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/server-auth";
import { ROLE_EXCLUSIVE_ROUTES, getRoleHomePath, isRouteAuthorizedForRole } from "@/lib/rbac";

function isRoleExclusivePath(pathname: string): boolean {
  const normalized = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  return ROLE_EXCLUSIVE_ROUTES.some(
    (rule) =>
      normalized === rule.prefix ||
      normalized.startsWith(rule.prefix.endsWith("/") ? rule.prefix : rule.prefix + "/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isRoleExclusivePath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session || !session.role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!isRouteAuthorizedForRole(pathname, session.role)) {
    const homeUrl = new URL(getRoleHomePath(session.role), request.url);
    return NextResponse.redirect(homeUrl);
  }

  const normalized = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  if (normalized === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  if (normalized === "/doctor") {
    return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
  }
  if (normalized === "/hospital") {
    return NextResponse.redirect(new URL("/hospital/dashboard", request.url));
  }
  if (normalized === "/patient") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/doctor/:path*",
    "/hospital/:path*",
    "/assistant/:path*",
    "/chat/:path*",
    "/dashboard/:path*",
    "/health-card/:path*",
    "/patient/:path*",
    "/reports/:path*",
    "/saved/:path*",
  ],
};
