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
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-10">
          
          {/* Logo with Glowing Ping Effects */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-28 h-28 rounded-full border border-sky-500/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute w-36 h-36 rounded-full border border-emerald-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '1.5s' }}></div>
            
            <div className="relative w-24 h-24 flex items-center justify-center z-10">
              <img src="/images/Oxpecker_icon.png" alt="Loading..." className="w-20 h-20 object-contain animate-breathing drop-shadow-lg" />
            </div>
          </div>
          
          {/* High-tech Progress Scanner */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-40 h-1 bg-slate-800/80 rounded-full overflow-hidden relative shadow-inner">
              <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-[shimmer_1.5s_infinite_ease-in-out]"></div>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] animate-pulse">Initializing Workspace</p>
          </div>

        </div>
      </div>
    );
  }

  return <>{children}</>;
}
