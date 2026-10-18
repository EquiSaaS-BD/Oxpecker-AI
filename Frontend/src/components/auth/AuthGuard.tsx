"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { MedicalLoader } from "@/components/shared/MedicalLoader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Public informational and discovery routes (no authentication required)
    const publicPages = [
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
      "/docs"
    ];

    const isPublicPage = publicPages.some(p => pathname === p || pathname.startsWith(p + "/"));

    // 1. Unauthenticated users:
    if (!isAuthenticated) {
      if (isPublicPage) {
        setIsAuthorized(true);
        return;
      }

      // Store intended destination so user returns here after login
      if (
        pathname !== "/login" &&
        pathname !== "/" &&
        !pathname.startsWith("/register") &&
        pathname !== "/reset-password"
      ) {
        const fullUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : pathname;
        sessionStorage.setItem("redirect_after_login", fullUrl);
      }

      router.replace("/login");
      return;
    }

    // 2. Role-Based Access Control (RBAC) for Authenticated Users:
    let hasAccess = true;

    if (pathname.startsWith("/admin")) {
      hasAccess = role === "admin";
    } else if (pathname.startsWith("/hospital/")) {
      hasAccess = role === "hospital" || role === "admin";
    } else if (pathname.startsWith("/assistant")) {
      hasAccess = role === "assistant" || role === "admin";
    } else if (pathname.startsWith("/doctor/")) {
      hasAccess = role === "doctor" || role === "admin";
    }

    if (!hasAccess) {
      // If user tries to access a restricted panel they don't own, redirect to their role home
      if (role === "patient") router.replace("/chat");
      else if (role === "doctor") router.replace("/doctor/dashboard");
      else if (role === "hospital") router.replace("/hospital/dashboard");
      else if (role === "admin") router.replace("/admin/dashboard");
      else if (role === "assistant") router.replace("/assistant");
      else router.replace("/login");
      return;
    }

    setIsAuthorized(true);
  }, [isLoading, isAuthenticated, role, pathname, router]);

  if (isLoading || !isAuthorized) {
    return <MedicalLoader fullScreen text="Loading" />;
  }

  return <>{children}</>;
}
