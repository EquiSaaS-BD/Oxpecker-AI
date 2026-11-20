"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function RedirectorContent() {
  const { isAuthenticated, isLoading, role, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (isLoading || hasRedirectedRef.current) return;

    if (isAuthenticated && user) {
      const view = searchParams?.get("view");
      if (view === "home") {
        return; // Let them stay on home page
      }

      const dashboardPaths: Record<string, string> = {
        patient: "/chat",
        doctor: "/doctor/dashboard",
        hospital: "/hospital/dashboard",
        admin: "/admin/dashboard",
        assistant: "/assistant"
      };

      const path = role && dashboardPaths[role] ? dashboardPaths[role] : "/chat";
      if (path) {
        hasRedirectedRef.current = true;
        router.replace(path);
      }
    }
  }, [isAuthenticated, isLoading, role, user, router, searchParams]);

  return null;
}

export function HomeRedirector() {
  return (
    <Suspense fallback={null}>
      <RedirectorContent />
    </Suspense>
  );
}
