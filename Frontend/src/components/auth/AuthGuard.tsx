"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isRouteAuthorizedForRole, getRoleHomePath } from "@/lib/rbac";

import { MedicalLoader } from "@/components/shared/MedicalLoader";

/**
 * Public pages that do NOT require authentication at all.
 * (Unauthenticated visitors can freely browse these.)
 */
const UNAUTHENTICATED_PUBLIC_PAGES = [
  "/doctors",
  "/hospitals",
  "/medicines",
  "/nutrition",
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
  "/scan",
  "/tv-monitor",
  "/profile",
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Normalize path: strip trailing slashes
    const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

    const isPublicPage = UNAUTHENTICATED_PUBLIC_PAGES.some(
      (p) => normalizedPath === p || normalizedPath.startsWith(p + "/")
    );

    // ── 1. Unauthenticated users ────────────────────────────────
    if (!isAuthenticated) {
      if (isPublicPage) {
        setIsAuthorized(true);
        return;
      }

      // Store intended destination so user returns here after login
      // (the redirect will be sanitized against their role in AuthContext.login)
      if (
        normalizedPath !== "/login" &&
        normalizedPath !== "/" &&
        !normalizedPath.startsWith("/register") &&
        normalizedPath !== "/reset-password"
      ) {
        const fullUrl = typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : pathname;
        sessionStorage.setItem("redirect_after_login", fullUrl);
      }

      router.replace("/login");
      return;
    }

    // ── 2. Authenticated: Full RBAC Boundary Enforcement ────────
    // Use the centralized RBAC engine to check authorization.
    // This handles BOTH directions:
    //   - Patient trying to access /doctor/* or /hospital/* → BLOCKED
    //   - Doctor trying to access /chat or /health-card → BLOCKED
    //   - Assistant trying to access /admin/* → BLOCKED
    //   - Etc.
    if (!isRouteAuthorizedForRole(normalizedPath, role)) {
      const home = getRoleHomePath(role);
      console.warn(
        `[RBAC] Access denied: role="${role}" attempted to access "${normalizedPath}". Redirecting to "${home}".`
      );
      router.replace(home);
      return;
    }

    setIsAuthorized(true);
  }, [isLoading, isAuthenticated, role, pathname, router]);

  if (isLoading || !isAuthorized) {
    return <MedicalLoader fullScreen text="Loading" />;
  }

  return <>{children}</>;
}
