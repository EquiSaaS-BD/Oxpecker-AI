"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function RedirectorContent() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading) return;
    
    if (isAuthenticated) {
      const view = searchParams?.get("view");
      if (view === "home") {
        return; // Let them stay on home page
      }

      // Otherwise redirect to dashboard
      const dashboardPaths: Record<string, string> = {
        patient: "/chat",
        doctor: "/doctor/dashboard",
        hospital: "/hospital/dashboard",
        admin: "/admin/dashboard",
        assistant: "/assistant"
      };
      
      const path = role && dashboardPaths[role] ? dashboardPaths[role] : "/chat";
      router.replace(path);
    }
  }, [isAuthenticated, isLoading, role, router, searchParams]);

  return null;
}

export function HomeRedirector() {
  return (
    <Suspense fallback={null}>
      <RedirectorContent />
    </Suspense>
  );
}
