/**
 * ═══════════════════════════════════════════════════════════════════
 *  Oxpecker AI — Centralized Role-Based Access Control (RBAC) Engine
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Single source of truth for:
 *   1. Role → Home dashboard mapping
 *   2. Route ownership & boundary enforcement
 *   3. Post-login redirect sanitization
 *   4. Role-scoped route authorization checks
 *
 *  This module is INTENTIONALLY pure (no React, no hooks, no DOM)
 *  so it can be imported from AuthContext, AuthGuard, login page,
 *  server middleware, and unit tests without side-effects.
 */

import type { UserRole } from "@/context/AuthContext";

// ── 1. Role → Home Dashboard Mapping ────────────────────────────
/**
 * Canonical home route for each authenticated role.
 * Used after login and when an unauthorized redirect bounces the user.
 */
export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case "patient":   return "/chat";
    case "doctor":    return "/doctor/dashboard";
    case "hospital":  return "/hospital/dashboard";
    case "admin":     return "/admin/dashboard";
    case "assistant": return "/assistant";
    default:          return "/login";
  }
}

// ── 2. Route Ownership Boundaries ───────────────────────────────
/**
 * Route prefixes that are EXCLUSIVE to a single role.
 * Order matters: more specific prefixes MUST appear first.
 */
const ROLE_EXCLUSIVE_ROUTES: { prefix: string; allowedRoles: UserRole[] }[] = [
  // Admin-only routes
  { prefix: "/admin",              allowedRoles: ["admin"] },

  // Doctor-only routes (the portal, not the public /doctors discovery page)
  { prefix: "/doctor/",            allowedRoles: ["doctor", "admin"] },
  { prefix: "/doctor",             allowedRoles: ["doctor", "admin"] },

  // Hospital-only routes (the portal, not the public /hospitals discovery page)
  { prefix: "/hospital/",          allowedRoles: ["hospital", "admin"] },
  { prefix: "/hospital",           allowedRoles: ["hospital", "admin"] },

  // Assistant-only routes
  { prefix: "/assistant",          allowedRoles: ["assistant", "admin"] },

  // Patient-exclusive routes (doctors/hospitals should NOT land here)
  { prefix: "/chat",               allowedRoles: ["patient", "admin"] },
  { prefix: "/dashboard",          allowedRoles: ["patient", "admin"] },
  { prefix: "/health-card",        allowedRoles: ["patient", "admin"] },
  { prefix: "/patient",            allowedRoles: ["patient", "admin"] },
  { prefix: "/reports",            allowedRoles: ["patient", "admin"] },
  { prefix: "/saved",              allowedRoles: ["patient", "admin"] },
];

/**
 * Public discovery and informational routes accessible to ALL roles
 * (and unauthenticated visitors).
 */
const PUBLIC_ROUTES: string[] = [
  "/doctors",       // Public doctor directory
  "/hospitals",     // Public hospital directory
  "/medicines",     // Medicine search
  "/nutrition",     // Nutrition info
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/refund",
  "/disclaimer",
  "/careers",
  "/press",
  "/docs",
  "/faq",
  "/scan",          // QR scan page (public)
  "/tv-monitor",    // Public TV monitor
  "/settings",      // Shared settings page (role-agnostic UI)
  "/appointments",  // Appointment management (all authenticated roles)
  "/profile",       // Public profile page
];

// ── 3. Route Authorization Check ────────────────────────────────
/**
 * Determines whether a given role is allowed to access a specific path.
 *
 * Returns:
 *   - `true`  → the user is authorized
 *   - `false` → the user must be redirected to their role home
 */
export function isRouteAuthorizedForRole(
  pathname: string,
  role: UserRole
): boolean {
  if (!role) return false;

  // Normalize: strip trailing slashes except root "/"
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

  // Check if it's a public route (accessible by everyone)
  const isPublic = PUBLIC_ROUTES.some(
    (pub) => normalizedPath === pub || normalizedPath.startsWith(pub + "/")
  );
  if (isPublic) return true;

  // Check exclusive route boundaries
  for (const rule of ROLE_EXCLUSIVE_ROUTES) {
    const matches =
      normalizedPath === rule.prefix ||
      normalizedPath.startsWith(rule.prefix.endsWith("/") ? rule.prefix : rule.prefix + "/");

    if (matches) {
      return rule.allowedRoles.includes(role);
    }
  }

  // No explicit restriction found → allow (general pages like "/")
  return true;
}

// ── 4. Post-Login Redirect Sanitizer ────────────────────────────
/**
 * Validates a stored redirect URL against the user's role.
 *
 * If the stored URL belongs to another role's exclusive zone,
 * discards it and returns the user's canonical home path instead.
 *
 * This prevents the "Session Storage Hijack" attack vector where a
 * user visits /hospital/dashboard, gets bounced to /login, then logs
 * in as a patient and gets blindly redirected to the hospital panel.
 */
export function getAuthorizedRedirectUrl(
  targetUrl: string | null,
  role: UserRole
): string {
  const home = getRoleHomePath(role);

  if (!targetUrl || !role) return home;

  // Strip origin if full URL was stored
  let pathname = targetUrl;
  try {
    const url = new URL(targetUrl, "http://localhost");
    pathname = url.pathname;
  } catch {
    // Already a relative path
  }

  // Auth routes, root, or patient profile/dashboard should NEVER hijack doctor/hospital login!
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/register") ||
    pathname === "/reset-password" ||
    pathname === "/profile" ||
    pathname === "/dashboard"
  ) {
    return home;
  }

  // Strict role boundaries for home redirect:
  if (role === "doctor" && !pathname.startsWith("/doctor")) {
    return home;
  }
  if (role === "hospital" && !pathname.startsWith("/hospital")) {
    return home;
  }
  if (role === "assistant" && !pathname.startsWith("/assistant")) {
    return home;
  }
  if (role === "patient" && (pathname.startsWith("/doctor") || pathname.startsWith("/hospital") || pathname.startsWith("/admin") || pathname.startsWith("/assistant"))) {
    return home;
  }

  // Validate the target against the user's role
  if (isRouteAuthorizedForRole(pathname, role)) {
    return targetUrl; // Original URL (preserves query params)
  }

  // Target is outside role boundary → discard and go home
  return home;
}
