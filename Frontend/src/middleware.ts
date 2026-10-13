import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseSessionPayload } from "@/lib/authCrypto";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, APIs, and images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("oxpecker_session")?.value;
  const session = parseSessionPayload(token);
  const isAuthenticated = !!session;
  const role = session?.role || null;

  // 2. Redirect authenticated users away from /login and /register
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    const roleRoutes: Record<string, string> = {
      patient: "/chat",
      doctor: "/doctor/dashboard",
      hospital: "/hospital/dashboard",
      admin: "/admin/dashboard",
      assistant: "/assistant",
    };
    const target = (role && roleRoutes[role]) || "/chat";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 3. Normalized path checking for clean matching (ignoring trailing slashes)
  const cleanPath = pathname.replace(/\/$/, "");

  // Protected Role-based routes
  const isDoctorRoute = cleanPath === "/doctor" || cleanPath.startsWith("/doctor/");
  const isHospitalRoute = cleanPath === "/hospital" || cleanPath.startsWith("/hospital/");
  const isAssistantRoute = cleanPath === "/assistant" || cleanPath.startsWith("/assistant/");
  const isAdminRoute = cleanPath === "/admin" || cleanPath.startsWith("/admin/");

  // Other protected user routes
  const isProtectedUserRoute = 
    cleanPath === "/dashboard" || cleanPath.startsWith("/dashboard/") ||
    cleanPath === "/appointments" || cleanPath.startsWith("/appointments/") ||
    cleanPath === "/settings" || cleanPath.startsWith("/settings/");

  const isRestrictedRoute = isDoctorRoute || isHospitalRoute || isAssistantRoute || isAdminRoute || isProtectedUserRoute;

  // 4. If user is unauthenticated and tries to access restricted routes:
  if (!isAuthenticated && isRestrictedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Role-Based Access Control (RBAC) enforcement for authenticated users:
  if (isAuthenticated) {
    let hasAccess = true;

    if (isAdminRoute) {
      hasAccess = role === "admin";
    } else if (isDoctorRoute) {
      hasAccess = role === "doctor" || role === "admin";
    } else if (isHospitalRoute) {
      hasAccess = role === "hospital" || role === "admin";
    } else if (isAssistantRoute) {
      hasAccess = role === "assistant" || role === "admin";
    }

    if (!hasAccess) {
      const roleHome: Record<string, string> = {
        patient: "/chat",
        doctor: "/doctor/dashboard",
        hospital: "/hospital/dashboard",
        admin: "/admin/dashboard",
        assistant: "/assistant",
      };
      const fallback = (role && roleHome[role]) || "/chat";
      return NextResponse.redirect(new URL(fallback, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
