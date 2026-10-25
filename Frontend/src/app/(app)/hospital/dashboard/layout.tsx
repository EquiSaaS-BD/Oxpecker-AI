"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { HospitalSidebar } from "@/components/hospital/HospitalSidebar";
import { HospitalHeader } from "@/components/hospital/HospitalHeader";
import { AccessDeniedModal } from "@/components/doctor/AccessDeniedModal";
import { PendingApprovalModal } from "@/components/shared/PendingApprovalModal";
import { DoctorDashboardSkeleton } from "@/components/doctor/DoctorDashboardSkeleton";
import { Toaster } from "sonner";

export default function HospitalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Restore collapsed sidebar preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("oxpecker_hospital_sidebar_collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    } catch {}
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("oxpecker_hospital_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <div className="w-[270px] bg-white border-r border-slate-200/80 hidden lg:block" />
        <div className="flex-1">
          <div className="h-16 bg-white border-b border-slate-200/80" />
          <DoctorDashboardSkeleton />
        </div>
      </div>
    );
  }

  // Access control
  if (!isAuthenticated || role !== "hospital") {
    return <AccessDeniedModal />;
  }

  if (user && user.status === "pending") {
    return <PendingApprovalModal />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Toaster position="top-right" richColors closeButton />

      {/* Collapsible Hospital Sidebar */}
      <HospitalSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
        {/* Header */}
        <HospitalHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-[1360px] mx-auto p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
