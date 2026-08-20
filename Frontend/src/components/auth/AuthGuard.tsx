"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Public informational routes (no authentication required)
    const publicPages = [
      "/about",
      "/contact",
      "/terms",
      "/privacy",
      "/refund",
      "/disclaimer",
      "/careers",
      "/press"
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
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white flex-col gap-3">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-xs">Checking authorization...</p>
      </div>
    );
  }

  return <>{children}</>;
}
